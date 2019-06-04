pragma solidity ^0.5.0;

contract Owned{
    //identifies the owner of the contract / admin
    address private owner;

    //log when owner is changed
    event LogOwnerChanged(address indexed sender, address indexed owner);

    //set the owner of the contract
    constructor() public{
        owner = msg.sender;
    }

    //a modifier that only the admin can do something
    modifier  onlyOwner() {
        require(owner == msg.sender,"You are not the owner");
        _;
    }

    //only the current owner should be able to change owner
    function changeOwner(address newOwner) public onlyOwner{
        require(newOwner != address(0), "Pass in valid address");
        owner = newOwner;
        emit LogOwnerChanged(msg.sender,newOwner);
    }

    function getOwner() public view returns (address _owner){
        _owner = owner;
    }
}