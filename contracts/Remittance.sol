pragma solidity ^0.5.0;
import "./Activatable.sol";
import 'node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Remittance is Activatable{
    using SafeMath for uint;

    struct Remit {
        address sender;
        uint amount;
    }
    mapping (bytes32 => Remit) private remittances;

    constructor(bool _activate) public Activatable(_activate){}

    event LogBalanceDeposited (address indexed sender,uint indexed amount);
    event LogWithdrawal (address indexed middleMan,address indexed sender,uint indexed amount);

    function remitEther(bytes32 hash)public ifAlive ifActivated payable{
        require(msg.value > 0,"You must send some Ether");
        require(hash!=bytes32(0), "0 can not be a hash");
        emit LogBalanceDeposited(msg.sender,msg.value);
        remittances[hash].sender = msg.sender;
        remittances[hash].amount = remittances[hash].amount.add(msg.value);
    }

    function getHash(string memory secret,address middleMan,address sender)public view returns(bytes32 hash){
        hash = keccak256(abi.encode(secret,middleMan,sender));
    }

    function withdraw(bytes32 hash,string memory secret,address depositor) public ifAlive ifActivated{
        require(remittances[hash].amount!=0,"Ether must have been deposited");
        bytes32 computeHash = getHash(secret,msg.sender,depositor);
        require(computeHash == hash,"Passwords do not match");
        emit LogWithdrawal(msg.sender,depositor,remittances[hash].amount);
        uint _amount = remittances[hash].amount;
        remittances[hash].amount = 0;
        msg.sender.transfer(_amount);
    }
}