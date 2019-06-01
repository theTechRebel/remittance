const Remittance = artifacts.require("Remittance");

contract('Remittance',accounts=>{
    const[owner,sender,reciever] = accounts;
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

})