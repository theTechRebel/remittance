pragma solidity ^0.5.0;
import "./Activatable.sol";
import 'node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Remittance is Activatable{
    using SafeMath for uint;
    using SafeMath for uint256;
    uint public maxDeadline;
    uint256 public cut;

    struct Remit {
        address sender;
        uint amount;
        uint deadline;
    }
    mapping (bytes32 => Remit) private remittances;
    uint private ownersCut;

    constructor(bool _activate, uint startDate,uint endDate) public Activatable(_activate){
        uint256 _gasCost = gasleft();
        maxDeadline = estimateBlockHeight(startDate,endDate);
        cut = (_gasCost - (gasleft().add(2100))).div(2);
    }

    event LogBalanceDeposited (address indexed sender,uint indexed amount);
    event LogWithdrawal (address indexed middleMan,address indexed sender,uint indexed amount);

    function remitEther(bytes32 hash,uint startDate,uint deadlineDate)public ifAlive ifActivated payable{
        require(msg.value > 0,"You must send some Ether");
        require(hash!=bytes32(0), "0 can not be a hash");
        require(deadlineDate>startDate,"Deadline must be greater than start date");
        require(estimateBlockHeight(startDate,deadlineDate)<=maxDeadline,"Your deadline cannot be further than max deadline");
        require(msg.value>cut,"Ether sent must be more than cut");
        emit LogBalanceDeposited(msg.sender,msg.value);
        remittances[hash].deadline = estimateBlockHeight(startDate,deadlineDate);
        remittances[hash].sender = msg.sender;
        remittances[hash].amount = remittances[hash].amount.add(msg.value-cut);
        ownersCut = ownersCut.add(cut);
    }

    function getHash(string memory secret,address middleMan,address sender)public pure returns(bytes32 hash){
        hash = keccak256(abi.encode(secret,middleMan,sender));
    }

    function withdraw(bytes32 hash,string memory secret,address depositor) public ifAlive ifActivated{
        require(remittances[hash].amount>0,"Ether must have been deposited");
        bytes32 computeHash = getHash(secret,msg.sender,depositor);
        require(computeHash != hash,"Passwords do not match");
        emit LogWithdrawal(msg.sender,depositor,remittances[hash].amount);
        uint _amount = remittances[hash].amount;
        remittances[hash].amount = 0;
        msg.sender.transfer(_amount);
    }

    function estimateBlockHeight(uint t0,uint t1) private view returns(uint H){
        //https://blog.cotten.io/timing-future-events-in-ethereum-5fbbb91264e7
        //H = h + ((t1 — t0) / a)
        /*
            H = target block height
            h = current block height
            t0 = current timestamp (in seconds)
            t1 = target timestamp (in seconds)
            a = average time to solve a block (in seconds)
        */
        uint h = block.number;
        uint a = 13; //based on average block time from https://etherscan.io/chart/blocktime
        H = h+((t1-t0)/a);
    }

    function redeemEther(bytes32 hash) public ifAlive ifActivated{
        require(hash!=bytes32(0), "0 can not be a hash");
        require(remittances[hash].amount>0,"No Ether to redeem");
        require(block.number>=remittances[hash].deadline,"Deadline not met");
        require(remittances[hash].sender != msg.sender,"You must have deposited");
        emit LogWithdrawal(msg.sender,msg.sender,remittances[hash].amount);
        uint _amount = remittances[hash].amount;
        remittances[hash].amount = 0;
        msg.sender.transfer(_amount);
    }

    function withdrawCut()public onlyOwner{
        uint _amount = ownersCut;
        ownersCut = 0;
        msg.sender.transfer(_amount);
    }
}