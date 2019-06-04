pragma solidity ^0.5.0;
import "./Activatable.sol";
import 'node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Remittance is Activatable{
    using SafeMath for uint;
    uint public maxDeadline;
    uint public cut;

    struct Remit {
        address sender;
        uint amount;
        uint deadline;
    }
    mapping (bytes32 => Remit) private remittances;
    mapping (address=>uint) private ownersCut;

    constructor(bool _activate,uint _cut, uint _maxDeadline) public Activatable(_activate){
        maxDeadline = _maxDeadline;
        cut = _cut;
        emit LogSetFee(getOwner(),_cut);
    }

    event LogBalanceDeposited(address indexed sender,uint indexed amount);
    event LogWithdrawal(address indexed shopOwner,address indexed sender,uint indexed amount);
    event LogSetFee(address indexed owner,uint indexed cut);

    function setFee(uint _cut) public onlyOwner ifAlive{
        cut = _cut;
        emit LogSetFee(getOwner(),_cut);
    }

    function remitEther(string memory secret,address shopOwner,uint deadline)public ifAlive ifActivated payable{
         require(msg.value > 0,"You must send some Ether");
         require(shopOwner != address(0),"Provide valid addresses");
         require(deadline<maxDeadline,"Deadline must be less than max deadline");
         bytes memory testString = bytes(secret);
         require(testString.length>0,"Secret can not be empty string");
         require(msg.value>cut,"Ether sent must be more than cut");
        bytes32 hash = getHash(secret,shopOwner);
        require(remittances[hash].amount==0,"This secret has already been used");
        emit LogBalanceDeposited(msg.sender,msg.value);
        remittances[hash].deadline = block.number.add(deadline);
        remittances[hash].sender = msg.sender;
        remittances[hash].amount = remittances[hash].amount.add(msg.value-cut);
        ownersCut[getOwner()] = ownersCut[getOwner()].add(cut);
    }

    function getHash(string memory secret,address shopOwner)public view returns(bytes32 hash){
        hash = keccak256(abi.encode(secret,shopOwner,address(this)));
    }

    function withdraw(string memory secret) public ifAlive ifActivated{
        bytes32 hash = getHash(secret,msg.sender);
        require(remittances[hash].amount>0,"Ether must have been deposited");
        emit LogWithdrawal(msg.sender,remittances[hash].sender,remittances[hash].amount);
        uint _amount = remittances[hash].amount;
        remittances[hash].amount = 0;
        remittances[hash].deadline = 0;
        msg.sender.transfer(_amount);
    }

    function redeemEther(string memory secret,address shopOwner) public ifAlive ifActivated{
        require(shopOwner != address(0),"Provide valid addresses");
        bytes memory testString = bytes(secret);
         require(testString.length>0,"Secret can not be empty string");
        bytes32 hash = getHash(secret,shopOwner);
        require(remittances[hash].amount>0,"No Ether to redeem");
        require(block.number>=remittances[hash].deadline,"Deadline not met");
        require(remittances[hash].sender == msg.sender,"You must have deposited");
        emit LogWithdrawal(msg.sender,msg.sender,remittances[hash].amount);
        uint _amount = remittances[hash].amount;
        remittances[hash].amount = 0;
        remittances[hash].deadline = 0;
        msg.sender.transfer(_amount);
    }

    function withdrawCut()public onlyOwner{
        require(ownersCut[msg.sender] > 0,"No cut to withdraw");
        uint _amount = ownersCut[msg.sender];
        ownersCut[msg.sender] = 0;
        msg.sender.transfer(_amount);
    }
}