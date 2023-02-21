/**
 *Submitted for verification at BscScan.com on 2023-02-20
*/

// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    constructor() {
        _transferOwnership(_msgSender());
    }
    modifier onlyOwner() {
        _checkOwner();
        _;
    }
    function owner() public view virtual returns (address) {
        return _owner;
    }
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

abstract contract Pausable is Context {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() {
        _paused = false;
    }
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }
    modifier whenPaused() {
        _requirePaused();
        _;
    }
    function paused() public view virtual returns (bool) {
        return _paused;
    }
    function _requireNotPaused() internal view virtual {
        require(!paused(), "Pausable: paused");
    }
    function _requirePaused() internal view virtual {
        require(paused(), "Pausable: not paused");
    }
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

abstract contract VRFConsumerBaseV2 {
    constructor(address _vrfCoordinator) {
        vrfCoordinator = _vrfCoordinator;
    }
    address private immutable vrfCoordinator;
    error OnlyCoordinatorCanFulfill(address have, address want);

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;
    function rawFulfillRandomWords(uint256 requestId,uint256[] memory randomWords) external {
        if (msg.sender != vrfCoordinator) {
            revert OnlyCoordinatorCanFulfill(msg.sender, vrfCoordinator);
        }
        fulfillRandomWords(requestId, randomWords);
    }
}

interface VRFCoordinatorV2Interface {
    function getRequestConfig() external view returns (uint16, uint32, bytes32[] memory);
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
    function createSubscription() external returns (uint64 subId);
    function getSubscription(uint64 subId) external view returns (
            uint96 balance,
            uint64 reqCount,
            address owner,
            address[] memory consumers);
    function requestSubscriptionOwnerTransfer(uint64 subId, address newOwner) external;
    function acceptSubscriptionOwnerTransfer(uint64 subId) external;
    function addConsumer(uint64 subId, address consumer) external;
    function removeConsumer(uint64 subId, address consumer) external;
    function cancelSubscription(uint64 subId, address to) external;
}

contract gameSPS is Ownable, Pausable, VRFConsumerBaseV2 {
    uint128 public bank;
    uint128 public active;   // 2 - true; 1 - false

    uint64 public FEE;
    uint64 constant MAX_CHOICE_NUMBER = 2;
    uint64 gameNumber;
    uint64 immutable s_subscriptionId;

    uint128 public ownerFunds;
    uint16 constant requestConfirmations = 3;
    uint16 offset;
    uint32 constant callbackGasLimit = 1000000;
    uint32 constant numWords = 1;
    uint16 immutable looseTimer;
    uint16 immutable duration;

    address constant vrfCoordinator = 0x6A2AAd07396B36Fe02a22b33cf443582f682c82f;
    bytes32 constant keyHash = 0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314;
    
    mapping (uint=>gameInfo) SPS;
    mapping (uint=>gameInfoPVP) spsPVP;

    struct gameInfoPVP{
        uint128 startsAt;
        uint128 endsAt;
        address winner;
        bool withrawPriseOrStopped;
        uint bidValue;               // first pay 2xbid.Value(bid.Value - for game, bid.Value - collateral),  
        address first;               // second pay bid.Value - for game
        address second;
        bytes32 firtstHashedChoice;
        uint128 firstChoice;         // 0 - stone, 1 - scissors, 2 -paper
        uint128 secondChoice; 
    }

    struct gameInfo {
        address winner;
        address player;
        uint bidValue;               
        uint128 playerChoice;        // 0 - stone, 1 - scissors, 2 - paper
        uint128 casinoChoice;
        bool paySuccess;
    }
    constructor(
        uint64 _FEE,
        uint64 subscriptionId,
        uint16 _duration,
        uint16 _looseTimer
        ) VRFConsumerBaseV2(vrfCoordinator) {
        FEE=_FEE;                    // suggest Fee - 10 (10%)
        duration=_duration;          // suggest duration - 600 (10min)
        looseTimer=_looseTimer;      // suggest - 10800 (3 hours)        
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        active=1;
    }
    VRFCoordinatorV2Interface COORDINATOR;
    error LooseTimer(uint currentTime, uint looseTime);

    event gameStart (uint indexed gameNumb,uint indexed gameValue);
    event gameEnd (uint indexed gameNumb,address indexed winner);
    event SomeoneMakeBid (uint indexed gameNumb);
    event gameStartPVP(uint indexed gameNumber,uint indexed startsAt,uint indexed endsAt,uint gameValue);
    
    //↓↓↓↓↓↓// PLAY WITH SC //↓↓↓↓↓↓
    ////////////////////////////////
    function startGameSPS (uint128 _playerChoice) external payable whenNotPaused() {
        require(msg.value>0.001 ether && msg.value<=bank, "Wrong value");
        require(_playerChoice<=MAX_CHOICE_NUMBER, "Wrong choice number");
        uint s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords);
        while(SPS[s_requestId].paySuccess) {
            s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords);
        }
        bank-=uint128(msg.value);
        active=2;
        SPS[s_requestId].player=_msgSender();
        SPS[s_requestId].playerChoice=_playerChoice;
        SPS[s_requestId].bidValue=msg.value;
        emit gameStart(s_requestId, SPS[s_requestId].bidValue);
    }

    function fulfillRandomWords(uint256 s_requestId, uint256[] memory randomWords) internal override {
        require(!SPS[s_requestId].paySuccess, "Prise received!");
        SPS[s_requestId].casinoChoice = uint128(getNewRandom(randomWords[0]));
        while(SPS[s_requestId].casinoChoice==SPS[s_requestId].playerChoice) {
            SPS[s_requestId].casinoChoice = uint128(getNewRandom(randomWords[0]));
        }
        if (SPS[s_requestId].playerChoice==0 && SPS[s_requestId].casinoChoice==1 
        || SPS[s_requestId].playerChoice==1  && SPS[s_requestId].casinoChoice==2
        || SPS[s_requestId].playerChoice==2  && SPS[s_requestId].casinoChoice==0
        ){
            SPS[s_requestId].winner=SPS[s_requestId].player;
            uint ownerAmount=SPS[s_requestId].bidValue*FEE/100;
            ownerFunds+=uint128(ownerAmount);
            SPS[s_requestId].paySuccess=true;
            offset=0;
            active=1;
            payable(SPS[s_requestId].winner).transfer(SPS[s_requestId].bidValue*2-ownerAmount);
            emit gameEnd(s_requestId, SPS[s_requestId].winner);
        }
        else  {
            SPS[s_requestId].winner=address(this);
            SPS[s_requestId].paySuccess=true;
            offset=0;
            active=1;
            bank+=uint128(SPS[s_requestId].bidValue);
            ownerFunds+=uint128(SPS[s_requestId].bidValue);
            emit gameEnd(s_requestId, SPS[s_requestId].winner);
        }
    }

    //↓↓↓↓↓↓// PLAY WITH OTHER GAMER //↓↓↓↓↓↓
    /////////////////////////////////////////
    function startPVPGameSPS (bytes32 _hashedChoice) external payable whenNotPaused() {
        require(msg.value>0.001 ether, "min 0.001BNB");
        gameNumber++;
        spsPVP[gameNumber].first=_msgSender();
        spsPVP[gameNumber].firtstHashedChoice=_hashedChoice;
        spsPVP[gameNumber].startsAt = uint128(block.timestamp);
        spsPVP[gameNumber].endsAt = uint128(block.timestamp+duration);
        spsPVP[gameNumber].bidValue=msg.value/2;
        emit gameStartPVP (gameNumber, spsPVP[gameNumber].startsAt, spsPVP[gameNumber].endsAt, spsPVP[gameNumber].bidValue);
    }

    function abort (uint _gameNumber) external  {
        require(block.timestamp>spsPVP[_gameNumber].endsAt, "Wait until game ends");
        require (_msgSender()==spsPVP[_gameNumber].first
        || _msgSender()==spsPVP[_gameNumber].second, "You not player");
        if (_msgSender()==spsPVP[_gameNumber].first) {
            require (spsPVP[_gameNumber].second==address(0), 
            "You must reveal choice");
            require(!spsPVP[_gameNumber].withrawPriseOrStopped, "Prise received or stopped");
            spsPVP[_gameNumber].withrawPriseOrStopped=true;
            payable(_msgSender()).transfer(spsPVP[_gameNumber].bidValue*2);
            emit gameEnd(_gameNumber, spsPVP[_gameNumber].winner);
        }
        if (_msgSender()==spsPVP[_gameNumber].second) {
            if (block.timestamp<spsPVP[_gameNumber].endsAt+looseTimer) {
                revert LooseTimer({
                    currentTime: block.timestamp,
                    looseTime: spsPVP[_gameNumber].endsAt+looseTimer
                });
            }
            require(!spsPVP[_gameNumber].withrawPriseOrStopped, "Prise received or stopped");
            spsPVP[_gameNumber].withrawPriseOrStopped=true;
            payable(_msgSender()).transfer(spsPVP[_gameNumber].bidValue);
            emit gameEnd(_gameNumber, spsPVP[_gameNumber].winner);
        }    
    } 

    function makeChoicePVP (uint _gameNumber, uint128 _choice) external payable {
        require(!spsPVP[_gameNumber].withrawPriseOrStopped, "Prise received or stopped");
        require(_choice<=MAX_CHOICE_NUMBER, "Wrong choice number");
        require(block.timestamp<spsPVP[_gameNumber].endsAt, "Game over");
        require(msg.value==spsPVP[_gameNumber].bidValue, "Wrong bid value");
        require (spsPVP[_gameNumber].second==address(0), "Someone already play");
        spsPVP[_gameNumber].second=_msgSender();
        spsPVP[_gameNumber].secondChoice=_choice;
        emit SomeoneMakeBid (_gameNumber);
    }

    function revealChoice (uint _gameNumber, uint128 _choice, string calldata _secret) external {
        require(!spsPVP[_gameNumber].withrawPriseOrStopped, "Prise received or stopped!");
        require(spsPVP[_gameNumber].second!=address(0), "Missing opponent!");
        bytes32 commit=keccak256(abi.encode(_choice, _secret, _msgSender()));
        require(commit==spsPVP[_gameNumber].firtstHashedChoice, "You can't change choice!");
        spsPVP[_gameNumber].withrawPriseOrStopped=true;
        spsPVP[_gameNumber].firstChoice=_choice;
        if (spsPVP[_gameNumber].firstChoice==spsPVP[_gameNumber].secondChoice) {
            payable(_msgSender()).transfer(spsPVP[_gameNumber].bidValue*2);
            payable(spsPVP[gameNumber].second).transfer(spsPVP[_gameNumber].bidValue);
            emit gameEnd(_gameNumber, spsPVP[_gameNumber].winner);
        }
        if (spsPVP[_gameNumber].firstChoice==0 && spsPVP[_gameNumber].secondChoice==1 
        || spsPVP[_gameNumber].firstChoice==1  && spsPVP[_gameNumber].secondChoice==2
        || spsPVP[_gameNumber].firstChoice==2  && spsPVP[_gameNumber].secondChoice==0
        ){
            spsPVP[_gameNumber].winner=spsPVP[_gameNumber].first;
            uint ownerAmount=spsPVP[_gameNumber].bidValue*2*FEE/100;
            payable(spsPVP[_gameNumber].winner).transfer(spsPVP[_gameNumber].bidValue*3-ownerAmount);
            ownerFunds+=uint128(ownerAmount);
            emit gameEnd(_gameNumber, spsPVP[_gameNumber].winner);
        }
        else {
            spsPVP[_gameNumber].winner=spsPVP[_gameNumber].second;
            uint ownerAmount=spsPVP[_gameNumber].bidValue*2*FEE/100;
            ownerFunds+=uint128(ownerAmount);
            payable(spsPVP[_gameNumber].winner).transfer(spsPVP[_gameNumber].bidValue*2-ownerAmount/2);
            payable(spsPVP[_gameNumber].first).transfer(spsPVP[_gameNumber].bidValue-ownerAmount/2);
            emit gameEnd(_gameNumber, spsPVP[_gameNumber].winner);
        }
    }

    function withdrawFEE() external onlyOwner {
        uint amount = ownerFunds;
        ownerFunds -= uint128(amount);
        payable(_msgSender()).transfer(amount);
    }

    function withdrawBank() external onlyOwner {
        require(active==1, "Not all games over");
        uint128 amount = bank;
        bank -= amount;
        payable(_msgSender()).transfer(amount);
    }

    //↓↓↓↓↓↓// SETTER //↓↓↓↓↓↓
    ////////////////////////////
    function setFee(uint64 _FEE) external onlyOwner {
        FEE=_FEE;
    }
    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }
    //↓↓↓↓↓↓// GETTER //↓↓↓↓↓↓
    ////////////////////////////
    function getWinner(uint _gameNumber) external view returns(address) {
        return SPS[_gameNumber].winner;
    }    
    function getWinnerPVP(uint _gameNumber) external view returns(address) {
        return spsPVP[_gameNumber].winner;
    }
    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
    function getNewRandom(uint x) internal returns (uint) {
        offset+=8;
        uint choice = uint((x >> offset) & 0xff);
        return (choice % 3);
    }
    function getGameInfo(uint _gameNumber) external view returns(gameInfo memory) {
        return SPS[_gameNumber];
    }
    function getGameInfoPVP(uint _gameNumber) external view returns(gameInfoPVP memory) {
        return spsPVP[_gameNumber];
    }
    
    receive() external payable {
        bank+=uint128(msg.value);
    }
}