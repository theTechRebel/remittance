pragma solidity ^0.5.0;
import "./Activatable.sol";

contract Remittance is Activatable{
    mapping (address => uint) public depositors;

    constructor(bool _activate) public Activatable(_activate){}

    event LogBalanceDeposited (address indexed sender,uint indexed amount);
    event LogWithdrawal (address indexed middleMan,address indexed sender,uint indexed amount);

    function remitEther()public ifAlive ifActivated payable{
        require(msg.value == 0,"You must send some Ether");
        emit LogBalanceDeposited(msg.sender,msg.value);
        depositors[msg.sender] += msg.value;
    }

    function getHash(string memory recieversPassword)public view ifAlive ifActivated returns(bytes32 middleManPassword){
        require(depositors[msg.sender]!=0,"You must have deposted some ether");
         middleManPassword = keccak256(abi.encodePacked(recieversPassword,msg.sender));
    }

    function withdraw(bytes32 middleManPassword,string memory recieversPassword,address depositor) public ifAlive ifActivated{
        require(depositors[depositor]!=0,"Depositor must have sent ether");
        bytes32 validPassword = keccak256(abi.encodePacked(recieversPassword,depositor));
        require(validPassword == middleManPassword,"Passwords do not match");
        emit LogWithdrawal(msg.sender,depositor,depositors[depositor]);
        uint amount = depositors[depositor];
        depositors[depositor] = 0;
        msg.sender.transfer(amount);
    }
}