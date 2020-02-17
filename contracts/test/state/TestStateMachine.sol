pragma solidity ^0.5.10;

import "./../../state/StateMachine.sol";


contract TestStateMachine is StateMachine {

    function createTransition(
        bytes32 _originState,
        bytes32 _targetState
    ) external {
        _createTransition(_originState, _targetState);
    }

    function transition(bytes32 _targetState) external {
        _transition(_targetState);
    }

}