pragma solidity ^0.5.0;

import "./Owned.sol";

contract Activatable is Owned{
    bool private activated; //current state of the contract
    bool private killed; //is the contract dead

    //log contract activation and deactivation
    event LogActivateDeactivate(address indexed sender, bool indexed active);
    //log contract activation and deactivation
    event LogContractDeath(address indexed sender);

    //upon instantiation set the active state of the contract
    constructor(bool _activate) public{
        activated = _activate;
        killed = false;
        emit LogActivateDeactivate(msg.sender,_activate);
    }

    //modifier check if contract is alive
    modifier ifAlive(){
                require(!killed,"Contract was killed");
                _;
            }

    //kill the contract
    function killContract() public ifDeactivated onlyOwner{
        emit LogContractDeath(msg.sender);
    }

    //modifier function - only execute some features of contract is activated
    modifier ifActivated(){
        require(activated,"Contract is not activated");
        _;
    }

    //modifier function - only execute some features of contract is deactivated
    modifier ifDeactivated(){
        require(!activated,"Contract is running, deactiavte first");
        _;
    }

    //stops the contract only if the owner calls it and only if the contract is activated
    function deactivateContract() public ifAlive onlyOwner ifActivated {
        activated = false;
        emit LogActivateDeactivate(msg.sender,activated);
    }

    //activates the contract only if the owner wills it
    function activateContract() public ifAlive onlyOwner ifDeactivated{
        activated = true;
        emit LogActivateDeactivate(msg.sender,activated);
    }

    //get the current status of the contract
    function isActivated() public view returns(bool actiavted){
        return activated;
    }
}