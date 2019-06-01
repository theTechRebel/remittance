const Remittance = artifacts.require("Remittance");

contract('Remittance',accounts=>{
    const[owner,sender,reciever,newOwner] = accounts;
    let instance;

    const getEventResult = (txObj, eventName) => {
        const event = txObj.logs.find(log => log.event === eventName);
        if (event) {
          return event.args;
        } else {
          return undefined;
        }
      };

      beforeEach(async() =>{
		instance = await Remittance.new(true,1559402931,1560007731, { from: owner });
    });

    it("should remit ether", async()=>{
        const secret = "secret";
        const ether = 1e18;
        const hash = await instance.getHash(secret,reciever,sender);
        const tx = await instance.remitEther(hash,1559402931,1559507731,{value:ether});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        let balance = await web3.eth.getBalance(instance.address);
        console.log(balance);
    });

    it("should withdraw ether", async()=>{
        const secret = "secret";
        const ether = 1e18;
        const hash = await instance.getHash(secret,reciever,sender);

        var tx = await instance.remitEther(hash,1559402931,1559607731,{value:ether});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        let deposit = await web3.eth.getBalance(instance.address);
        console.log("Deposited: "+deposit);

        tx = await instance.withdraw(hash,secret,owner,{from:reciever});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");

        let withdrawn = await web3.eth.getBalance(instance.address);
        console.log("Balance after deposit: "+withdrawn);
        
        console.log("Withdraw Ether: "+(deposit-withdrawn));
    });

    it("should withdraw cut", async()=>{
        const secret = "secret";
        const ether = 1e18;
        const hash = await instance.getHash(secret,reciever,sender);

        var tx = await instance.remitEther(hash,1559402931,1559607731,{value:ether});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        let deposit = await web3.eth.getBalance(instance.address);
        console.log("Deposited: "+deposit);

        tx = await instance.withdrawCut({from:owner});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
    });

    it("should redeem ether", async()=>{
        const secret = "secret";
        const ether = 1e18;
        const hash = await instance.getHash(secret,reciever,sender);

        var tx = await instance.remitEther(hash,1559402931,1559402932,{value:ether});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
        let deposit = await web3.eth.getBalance(instance.address);
        console.log("Deposited: "+deposit);

        tx = await instance.redeemEther(hash,{from:sender});
        assert.isTrue(tx.receipt.status,"transaction must be succesful");
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