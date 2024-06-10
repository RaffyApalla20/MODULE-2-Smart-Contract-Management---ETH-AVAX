// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Assessment {
    mapping(address => uint256) public balances;
    
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Notification(string message);

    function deposit() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
        emit Notification("Deposit successful");
    }
    
    function withdraw(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        payable(msg.sender).transfer(_amount);
        balances[msg.sender] -= _amount;
        emit Withdrawal(msg.sender, _amount);
        emit Notification("Withdrawal successful");
    }
    
    function transfer(address _to, uint256 _amount) external {
        require(_to != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        
        emit Transfer(msg.sender, _to, _amount);
        emit Notification("Transfer successful");
    }
}
