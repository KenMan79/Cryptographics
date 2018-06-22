pragma solidity ^0.4.23;

import "./ImageToken.sol";
import "../Utils/Functions.sol";
import "../AssetManager.sol";


contract DigitalPrintImage is ImageToken,Functions {

    struct ImageMetadata {
        uint randomSeed;
        uint iterations;
        bytes32[] potentialAssets;
        uint timestamp;
        string author;
        address owner;
        bytes32 ipfsHash;
    }


    mapping(uint => bool) seedExists;
    mapping(uint => ImageMetadata) public imageMetadata;


    AssetManager assetManager;


    /// @notice Function will create new image
    /// @dev owner of image will be msg.sender, and timestamp will be automatically generated, timestamp will be automatically generated
    /// @dev _txHash and _timestamp together with keccak256 will give us randomSeed for user
    /// @param _randomHashIds is array of random hashes from our array
    /// @param _timestamp is timestamp when image is created
    /// @param _iterations is number of how many times he generated random asset positions until he liked what he got
    /// @param _potentialAssets is set of all potential assets user selected for an image
    /// @param _author is nickname of image owner
    /// @param _ipfsHash is ipfshash of the image
    /// @return returns id of created image
    function createImage(uint[] _randomHashIds, uint _timestamp, uint _iterations, bytes32[]  _potentialAssets, string _author, bytes32 _ipfsHash) public payable returns (uint) {
        require(_potentialAssets.length <= 5);
        require(seedExists[finalSeed] == false);

        uint randomSeed = calculateSeed(_randomHashIds, _timestamp);
        uint finalSeed = uint(getFinalSeed(randomSeed, _iterations));

        uint[] memory pickedAssets;

        (pickedAssets,,) = pickRandomAssets(randomSeed,_iterations, _potentialAssets);
        address _owner = msg.sender;

        uint finalPrice = calculatePrice(pickedAssets, _owner);
        require(msg.value >= finalPrice);

        assetManager.givePermission(msg.sender, pickedAssets);
        uint id = createImage(_owner);

        imageMetadata[id] = ImageMetadata({
            randomSeed: randomSeed,
            iterations: _iterations,
            potentialAssets: _potentialAssets,
            timestamp: _timestamp,
            author: _author,
            owner: _owner,
            ipfsHash: _ipfsHash
            });


        return id;
    }

    /// @notice Function to calculate final price for an image based on selected assets
    /// @param _pickedAssets is array of picked assets
    /// @param _owner is address of image owner
    /// @return finalPrice for the image
    function calculatePrice(uint [] _pickedAssets, address _owner) public view returns (uint) {
        if(_pickedAssets.length == 0) {
            return 0;
        }
        uint finalPrice = 0;
        for(uint i=0; i<_pickedAssets.length; i++){
            if(assetManager.checkHasPermission(_owner, _pickedAssets[i]) == false){
                finalPrice += assetManager.getAssetPrice(_pickedAssets[i]);
            }
        }
        return finalPrice;
    }


    /// @notice Function to add assetManager
    /// @dev during testing can be changed, after deployment to main network can be set only once
    /// @param _assetManager is address of assetManager contract
    function addAssetManager(address _assetManager) public onlyOwner {
        assetManager = AssetManager(_assetManager);
    }

    function getImageMetadata(uint _imageId) public view returns(uint, uint, bytes32[], uint, string, address, bytes32) {
        require(_imageId < numOfImages);

        ImageMetadata memory metadata = imageMetadata[_imageId];

        return(metadata.randomSeed, metadata.iterations, metadata.potentialAssets, metadata.timestamp, metadata.author, metadata.owner, metadata.ipfsHash);

    }

    function getIpfsHash(uint _imageId) public view returns (bytes32) {
        require(_imageId < numOfImages);

        ImageMetadata memory metadata = imageMetadata[_imageId];

        return (metadata.ipfsHash);
    }

}