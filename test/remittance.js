const Remittance = artifacts.require("Remittance");

contract('Remittance',accounts=>{
    const[newOwner,owner,sender,reciever] = accounts;
    let instance;

    const getEventResult = (txObj, eventName) => {
        const event = txObj.logs.find(log => log.event === eventName);
        if (event) {
          return event.args;
        } else {
          return undefined;
        }
      };
      
      const mineBlock = function () {
        return new Promise((resolve, reject) => {
          web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine"
          }, (err, result) => {
            if(err){ return reject(err) }
            return resolve(result)
          });
        })
      };

      beforeEach(async() =>{
		instance = await Remittance.new(true,2100,50, { from: owner });
    });

    it("should remit ether", async()=>{
        const secret = "secret";
        const ether = 1e18;
        var converted = await web3.utils.fromAscii(secret);
        var hash = await instance.getHash(converted,reciever);
        const tx = await instance.remitEther(hash,5,{value:ether});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        let balance = await web3.eth.getBalance(instance.address);
        console.log("Remitted: "+balance);
    });

    it("should withdraw ether", async()=>{
        const secret = "secret";
        var ether = 1e18;
        //1. Deposit
        var converted = await web3.utils.fromAscii(secret);
        var hash = await instance.getHash(converted,reciever);
        var tx = await instance.remitEther(hash,5,{value:ether,from:sender});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        let deposit = await web3.eth.getBalance(instance.address);
        console.log("Deposited: "+deposit);

        //2. Withdraw
        const balbefore = web3.utils.toBN(await web3.eth.getBalance(reciever));
        console.log("Reciever balance before: "+balbefore.toString());
        tx = await instance.withdraw(converted,{from:reciever});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
            //calculate transaction cost
        const transaction =  await web3.eth.getTransaction(tx.tx);
            // transaction cost = gasUsed x gasPrice
        const txCost = web3.utils.toBN(tx.receipt.gasUsed).mul(web3.utils.toBN(transaction.gasPrice));
        const balafter = web3.utils.toBN(await web3.eth.getBalance(reciever));
        console.log("Reciever balance after: "+balafter.toString());
        const withdrawn = balafter.sub((balbefore.sub(txCost)));
        console.log("Withdrawn: "+withdrawn);
        
        //3. Compare
        const fee = web3.utils.toBN(await instance.cut());
        console.log("The fee:"+fee);
        const withdrawable = web3.utils.toBN(ether).sub(fee);
        console.log("Withdrawable: "+withdrawable);
        assert.equal(withdrawn.toString(),withdrawable.toString(),"Withdrawn amount must equal withdrawable amount");
    });

    it("should withdraw cut", async()=>{
        const secret = "secret";
        const ether = 1e18;

        //1. Depsot
        var converted = await web3.utils.fromAscii(secret);
        var hash = await instance.getHash(converted,reciever);
        var tx = await instance.remitEther(hash,5,{value:ether,from:sender});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        let deposit = await web3.eth.getBalance(instance.address);

        //2. Withdraw cut
        const balbefore = web3.utils.toBN(await web3.eth.getBalance(owner));
        console.log("Balanace before withdrawl: "+balbefore);
        tx = await instance.withdrawCut({from:owner});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        const fee = web3.utils.toBN(await instance.cut.call());
         //calculate transaction cost
        const transaction =  await web3.eth.getTransaction(tx.tx);
         // transaction cost = gasUsed x gasPrice
         const txCost = web3.utils.toBN(tx.receipt.gasUsed).mul(web3.utils.toBN(transaction.gasPrice));
        
        //3. compare
         const balafter = web3.utils.toBN(await web3.eth.getBalance(owner));
         console.log("Balance after withdrawal: "+balafter);
        const withdrawn = balafter.sub((balbefore.sub(txCost)));
        assert.equal(withdrawn.toString(),fee.toString(),"Withdrawn amount should equal fee");
    });

    it("should redeem ether after time has elapsed", async()=>{
        const secret = "secret";
        const ether = 1e18;

        var converted = await web3.utils.fromAscii(secret);
        var hash = await instance.getHash(converted,reciever);
        var tx = await instance.remitEther(hash,5,{value:ether,from:sender});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        for(i=0;i<10;i++){
          await mineBlock();
        }
        let deposit = await web3.eth.getBalance(instance.address);
        console.log("Deposited: "+deposit);

        tx = await instance.redeemEther(hash,{from:sender});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
    });

    it("should fail to redeem ether before time has elapsed", async()=>{
      const secret = "secret";
      const ether = 1e18;

      var converted = await web3.utils.fromAscii(secret);
      var hash = await instance.getHash(converted,reciever);
      var tx = await instance.remitEther(hash,30,{value:ether,from:sender});
      assert.isTrue(tx.receipt.status,"transaction must be succesful");
      let deposit = await web3.eth.getBalance(instance.address);
      console.log("Deposited: "+deposit);
      for(i=0;i<28;i++){
        await mineBlock();
      }
      try{
      tx = await instance.redeemEther(hah,{from:sender});
      }catch(ex){
        return true;
      }
      throw new Error("Redeeming ether should have failed")
  });

    it("should allow owner to change owner address",async()=>{
        const txObj = await instance.changeOwner(newOwner,{from:owner});
        //check status
        assert.isTrue(txObj.receipt.status,"receipt status must be true");
        //check event
        const event = getEventResult(txObj,"LogOwnerChanged");
        assert.equal(event.sender,owner,"Old owner must be changed");
        assert.equal(event.owner,newOwner,"New owner must be set");
      });
  
      it("should allow activation and deactivation of contract",async()=>{
        var txObj = await instance.deactivateContract({from:owner});
        //check status
        assert.isTrue(txObj.receipt.status,"receipt status must be true");
        //check event
        var event = getEventResult(txObj,"LogActivateDeactivate");
        assert.equal(event.sender,owner,"function must have been execute by owner");
        assert.equal(event.active,false,"contract must be deactivated");
  
        txObj = await instance.activateContract({from:owner});
        //check status
        assert.isTrue(txObj.receipt.status,"receipt status must be true");
        //check event
        event = getEventResult(txObj,"LogActivateDeactivate");
        assert.equal(event.sender,owner,"function must have been execute by owner");
        assert.equal(event.active,true,"failed to actiavted");
      });
  
      it("should allow killing of contract by owner", async()=>{
        var txObj = await instance.deactivateContract({from:owner});
         assert.isTrue(txObj.receipt.status,"receipt status must be true");
         txObj = await instance.killContract({from:owner});
         assert.isTrue(txObj.receipt.status,"receipt status must be true");
         //check event
        const event = getEventResult(txObj,"LogContractDeath");
        assert.equal(event.sender,owner,"function must have been executed by owner");
      })
  

})