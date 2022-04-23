//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract {
    IERC20 private _rewardsToken;
    IERC20 private _stakingToken;
    mapping(address => uint256) private _stakingAmounts;
    mapping(address => uint256) private _stakingTimestamps;
    uint256 private _rewardTimeoutSeconds = 600;
    uint256 private _unstakeTimeoutSeconds = 1200;
    uint256 private _rewardRate = 5;
    address private _owner;

    modifier restricted() {
        require(
            msg.sender == _owner,
            "Only the owner of the contract can perform this operation"
        );
        _;
    }

    constructor(address rewardsToken, address stakingToken) {
        _owner = msg.sender;
        _rewardsToken = IERC20(rewardsToken);
        _stakingToken = IERC20(stakingToken);
    }

    function claimTimeout() public view returns (uint256) {
        return _rewardTimeoutSeconds;
    }

    function unstakeTimeout() public view returns (uint256) {
        return _unstakeTimeoutSeconds;
    }

    function rewardRate() public view returns (uint256) {
        return _rewardRate;
    }

    function changeSettings(
        uint256 rewardTimeoutSeconds,
        uint256 unstakeTimeoutSeconds,
        uint256 rewardRate
    ) external restricted {
        require(rewardRate > 0, "Reward rate must be greater than 0");
        _rewardTimeoutSeconds = rewardTimeoutSeconds;
        _unstakeTimeoutSeconds = unstakeTimeoutSeconds;
        _rewardRate = rewardRate;
    }

    function stake(uint256 amount) external {
        require(
            _stakingToken.transferFrom(msg.sender, address(this), amount),
            "Couldn't stake LP tokens"
        );

        _stakingAmounts[msg.sender] += amount;
        _stakingTimestamps[msg.sender] = block.timestamp;
    }

    function getStakingAmount(address addrs) public view returns (uint256) {
        return _stakingAmounts[addrs];
    }

    function getStakingTimestamp(address addrs) public view returns (uint256) {
        return _stakingTimestamps[addrs];
    }

    function claim() external {
        uint256 stakingTimestamp = _stakingTimestamps[msg.sender];
        uint256 amount = _stakingAmounts[msg.sender];
        require(stakingTimestamp > 0 && amount > 0, "Nothing to claim");
        require(
            stakingTimestamp + (_rewardTimeoutSeconds) <= block.timestamp,
            "Reward timeout has not expired yet"
        );
        _rewardsToken.transfer(msg.sender, amount / _rewardRate);
        _stakingTimestamps[msg.sender] = 0;
    }

    function unstake() external {
        require(_stakingAmounts[msg.sender] > 0, "Nothing to unstake");
        require(
            _stakingTimestamps[msg.sender] + (_unstakeTimeoutSeconds) <=
                block.timestamp,
            "Unstake timeout has not expired yet"
        );
        require(
            _stakingToken.transfer(msg.sender, _stakingAmounts[msg.sender]),
            "Couldn't unstake LP tokens"
        );
        _stakingAmounts[msg.sender] = 0;
        _stakingTimestamps[msg.sender] = 0;
    }
}
