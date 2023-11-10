pragma solidity ^0.4.24;

// https://github.com/qtumproject/qtumjs/issues/4
contract ArrayArguments {
    function takeArray(address[] memory addresses) public {}
}
