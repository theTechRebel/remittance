require("file-loader?name=../index.html!../index.html");
require('../scss/app.scss');
const Web3 = require("web3");
const Promise = require("bluebird");
const truffle = require("truffle-contract");
const $ = require("jquery");
const RemittanceJson = require("../../build/contracts/Remittance.json");



App = {
    web3Provider:null,
    contract:null,
    account:null,

    init: async ()=>{
        return await App.initWeb3();
    },

    initWeb3: async ()=>{
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
            // Request account access
            await window.ethereum.enable();
            } catch (error) {
            // User denied account access...
            console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
            return App.initContract();
        },

        initContract: async()=>{
            App.contract =  truffle(RemittanceJson);
            App.contract.setProvider(App.web3Provider);
            console.log("App loaded");

            const accounts = await web3.eth.getAccounts();
            if(accounts.length == 0 ){
                alert("No contract available for user");
                  throw new Error("No account with which to transact");
            }

            App.account = accounts[0];
            $("#currentAddress").html(App.account);
            console.log("Account:", App.account);

            App.getContractBalance();
            return App.bindEvents();
        },

        bindEvents: async()=>{
            $(document).on('click', '#remit', App.handleRemit);
            $(document).on('click','#withdraw', App.handleWithdraw);
            $(document).on('click',"#withdraw_owner",App.handleWithdrawCut);
        },

        getContractBalance: async ()=>{
            var contract = await App.contract.deployed();
            console.log(contract);
            console.log(contract.address);
            var bal = await web3.eth.getBalance(contract.address);
            var cut = await contract.cut.call();
            var maxdeadline = await contract.maxDeadline.call();

            $("#balance").html(bal+" Wei");
            $("#cut").html(cut+" Wei");
            $("#maxdeadline").html(maxdeadline+" Blocks");
            
          console.log(bal);
        },
        handleRemit: async()=>{
            var reciever = $("#reciever").val();
            var secret = $("#secret").val();
            var deadline = $("#deadline").val();
            var amount = $("#ether").val();

            var contract = await App.contract.deployed();
            var converted = await web3.utils.fromAscii(secret);
            var hash = await contract.getHash(converted,reciever);

            var call = await contract.remitEther.call(hash,deadline,{from:App.account,value:amount});
            console.log(call);
            
            if(call){
                console.log(call);
                await contract.remitEther(hash,deadline,{from:App.account,value:amount})
                .on("transactionHash",async (hash)=>{
                    var msg =  "<div class='alert alert-primary' role='alert'>Your transaction with Hash"+hash+" is on its way!</div>";
                    $("#msg").html(msg);
                })
                .on("confirmation",async(confirmationNumber, receipt)=>{
                    var msg =  "<div class='alert alert-primary' role='alert'>Your transaction has been confirmed with: "+confirmationNumber+"</div>";
                    $("#msg").html(msg);
                    console.log(receipt);
                })
                .on("receipt",async(receipt)=>{
                    if(receipt.status == 1){
                        var msg =  "<div class='alert alert-success' role='alert'>Transaction was succesful</div>";
                        $("#msg").html(msg);
                      }else{
                        var msg =  "<div class='alert alert-danger' role='alert'>Transaction has failed</div>";
                        $("#msg").html(msg);
                      }
                        console.log(receipt);
                })
                .on("error",async(error)=>{
                    var msg =  "<div class='alert alert-danger' role='alert'>Transaction failed due to: "+error+"</div>";
                    $("#msg").html(msg);
                });
                App.getContractBalance();
            }else{
                console.log(call);
            }

        },
        handleWithdraw:async()=>{
            var secret = $("#secret_withdraw").val();
            var contract = await App.contract.deployed();
            var converted = await web3.utils.fromAscii(secret);
            var call = await contract.withdraw.call(converted,{from:App.account});
            console.log(call);

            if(call){
                await contract.withdraw(converted,{from:App.account})
                .on("transactionHash",async (hash)=>{
                    var msg =  "<div class='alert alert-primary' role='alert'>Your transaction with Hash"+hash+" is on its way!</div>";
                    $("#msg").html(msg);
                })
                .on("confirmation",async(confirmationNumber, receipt)=>{
                    var msg =  "<div class='alert alert-primary' role='alert'>Your transaction has been confirmed with: "+confirmationNumber+"</div>";
                    $("#msg").html(msg);
                    console.log(receipt);
                })
                .on("receipt",async(receipt)=>{
                    if(receipt.status == 1){
                        var msg =  "<div class='alert alert-success' role='alert'>Transaction was succesful</div>";
                        $("#msg").html(msg);
                      }else{
                        var msg =  "<div class='alert alert-danger' role='alert'>Transaction has failed</div>";
                        $("#msg").html(msg);
                      }
                        console.log(receipt);
                })
                .on("error",async(error)=>{
                    var msg =  "<div class='alert alert-danger' role='alert'>Transaction failed due to: "+error+"</div>";
                    $("#msg").html(msg);
                });
                App.getContractBalance();
            }else{
                console.log(call);
            }
        },
        handleWithdrawCut:async()=>{
            var contract = await App.contract.deployed();
            var call = await contract.withdrawCut.call({from:App.account});
            console.log(call);
            
            if(call){
                console.log(call);
                await contract.withdrawCut({from:App.account})
                .on("transactionHash",async (hash)=>{
                    var msg =  "<div class='alert alert-primary' role='alert'>Your transaction with Hash"+hash+" is on its way!</div>";
                    $("#msg").html(msg);
                })
                .on("confirmation",async(confirmationNumber, receipt)=>{
                    var msg =  "<div class='alert alert-primary' role='alert'>Your transaction has been confirmed with: "+confirmationNumber+"</div>";
                    $("#msg").html(msg);
                    console.log(receipt);
                })
                .on("receipt",async(receipt)=>{
                    if(receipt.status == 1){
                        var msg =  "<div class='alert alert-success' role='alert'>Transaction was succesful</div>";
                        $("#msg").html(msg);
                      }else{
                        var msg =  "<div class='alert alert-danger' role='alert'>Transaction has failed</div>";
                        $("#msg").html(msg);
                      }
                        console.log(receipt);
                })
                .on("error",async(error)=>{
                    var msg =  "<div class='alert alert-danger' role='alert'>Transaction failed due to: "+error+"</div>";
                    $("#msg").html(msg);
                });
                App.getContractBalance();
            }else{
                console.log(call);
            }
        }
};

$(window).on('load', function() {
    App.init();
});