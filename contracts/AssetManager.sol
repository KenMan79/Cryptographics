pragma solidity ^0.4.23;
import "./Utils/Ownable.sol";


contract AssetManager is Ownable {

    struct Asset {
        uint id;
        /// atributes field is going to be 3 digit uint where every digit can be "1" or "2"
        /// 1st digit will tell us if asset is background 1 - true / 2 - false
        /// 2nd digit will tell us if rotation is enabled 1 - true / 2 - false
        /// 3rd digit will tell us if scaling  is enabled 1 - true / 2 - false
        uint pack_id;
        uint attributes;
        bytes32 ipfsHash;
    }

    struct AssetPack {
        bytes32 packCover;
        string name;
        uint [] assetIds;
        address creator;
        uint price;
    }


    uint numberOfAssets;
    uint numberOfAssetPacks;


    Asset [] assets;
    AssetPack [] assetPacks;



    mapping(address => uint) artistBalance;
    mapping(bytes32 => bool) hashExists;

    mapping(address => uint[]) createdAssetPacks;
    mapping(address => uint[]) boughtAssetPacks;




    /// @notice Function to create assetpack
    /// @dev ADD ATTRIBUTES VALIDATION
    /// @param _packCover is cover image for asset pack
    /// @param _name is name of the asset pack
    /// @param _attributes is array of attributes
    /// @param _ipfsHashes is array containing all ipfsHashes for assets we'd like to put in pack
    /// @param _packPrice is price for total assetPack (every asset will have average price)
    function createAssetPack(bytes32 _packCover, string _name, uint[] _attributes, bytes32[] _ipfsHashes, uint _packPrice) public {
        require(_ipfsHashes.length > 0);
        require(_ipfsHashes.length < 50);
        require(_attributes.length < 50);

        uint[] memory ids = new uint[](_ipfsHashes.length);

        for(uint i=0; i< _ipfsHashes.length; i++){
            ids[i] = numberOfAssets;
            createAsset(_attributes[i], _ipfsHashes[i], numberOfAssetPacks);
        }

        assetPacks.push(AssetPack({
            packCover: _packCover,
            name: _name,
            assetIds: ids,
            creator: msg.sender,
            price: _packPrice
            }));

        createdAssetPacks[msg.sender].push(numberOfAssetPacks);
        numberOfAssetPacks++;
    }

    /// @notice Function which creates an asset
    /// @dev this method will be internal/private later in production
    /// @dev id is automatically generated, and it's it's position in array which holds all assets, also, creator of asset is msg.sender
    /// @dev add attributes validation
    /// @param _attributes is meta info for asset
    /// @param _ipfsHash is ipfsHash to image of asset
    function createAsset(uint _attributes, bytes32 _ipfsHash, uint _packId) public {
        require(hashExists[_ipfsHash] == false);

        assets.push(Asset({
            id : numberOfAssets,
            pack_id: _packId,
            attributes: _attributes,
            ipfsHash : _ipfsHash
            }));

        hashExists[_ipfsHash] = true;
        numberOfAssets++;
    }


    function buyAssetPack(uint _assetPackId) public payable {
        ///validate if user have already bought permission for this pack
        for(uint i=0; i<boughtAssetPacks[msg.sender].length; i++) {
            require(boughtAssetPacks[msg.sender][i] != _assetPackId);
        }

        AssetPack memory assetPack = assetPacks[_assetPackId];
        require(msg.value >= assetPack.price);
        artistBalance[assetPack.creator] += assetPack.price;
        boughtAssetPacks[msg.sender].push(_assetPackId);
    }


    /// @notice Function to fetch total number of assets
    /// @return numberOfAssets
    function getNumberOfAssets() public view returns (uint) {
        return numberOfAssets;
    }

    /// @notice Function to fetch total number of assetpacks
    /// @return uint numberOfAssetPacks
    function getNumberOfAssetPacks() public view returns(uint) {
        return numberOfAssetPacks;
    }
    /// @notice Function to check if user have permission (owner / bought) for pack
    /// @param _address is address of user
    /// @param _packId is id of pack
    function checkHasPermissionForPack(address _address, uint _packId) public view returns (bool) {
        AssetPack memory assetPack = assetPacks[_packId];
        if(assetPack.creator ==  _address) {
            return true;
        }
        for(uint i=0; i<boughtAssetPacks[_address].length; i++) {
            if(boughtAssetPacks[_address][i] == _packId) {
                return true;
            }
        }
        return false;
    }

    /// @notice Function to check does hash exist in mapping
    /// @param _ipfsHash is bytes32 representation of hash
    function checkHashExists(bytes32 _ipfsHash) public view returns (bool){
        return hashExists[_ipfsHash];
    }

    /// @notice Function to give you permission for all assets you are buying during image creation
    /// @param _address is address of buyer
    /// @param _packId is id of assetpack
    function givePermission(address _address, uint _packId) public {
        boughtAssetPacks[_address].push(_packId);
    }

    function pickUniquePacks(uint [] assetIds) public view returns (uint[]){
        require(assetIds.length > 0);
        uint[] memory packs = new uint[](assetIds.length);
        uint last = 1;
        Asset memory asset1 = assets[assetIds[0]];
        packs[0] = asset1.pack_id;
        uint flag = 0;
        for(uint i=0; i<assetIds.length; i++){
            Asset memory asset = assets[assetIds[i]];
            for(uint j=0; j<last;j++) {
                if(asset.pack_id == packs[j]) {
                    flag = 1;
                }
            }
            if(flag == 0) {
                packs[last] = asset.pack_id;
                last++;
            }
            flag = 0;
        }

        uint[] memory finalPacks = new uint[](last);
        for(uint z=0; z<last; z++) {
            finalPacks[z] = packs[z];
        }
        return finalPacks;
    }
    /// @notice Method to get all info for an asset
    /// @param id is id of asset
    /// @return All data for an asset
    function getAssetInfo(uint id) public view returns (uint, uint, bytes32){
        require(id >= 0);
        require(id < numberOfAssets);
        Asset memory asset = assets[id];

        return (asset.id, asset.attributes, asset.ipfsHash);
    }



    function getAssetPacksUserCreated(address _address) public view returns(uint[]){
        return createdAssetPacks[_address];
    }

    /// @notice Function to get ipfsHash for selected asset
    /// @param _id is id of asset we'd like to get ipfs hash
    /// @return string representation of ipfs hash of that asset
    function getAssetIpfs(uint _id) public view returns (bytes32) {
        require(_id < numberOfAssets);
        Asset memory asset = assets[_id];
        return asset.ipfsHash;
    }

    /// @notice Function to get attributes for selected asset
    /// @param _id is id of asset we'd like to get ipfs hash
    /// @return uint representation of attributes of that asset
    function getAssetAttributes(uint _id) public view returns (uint) {
        require(_id < numberOfAssets);
        Asset memory asset = assets[_id];
        return asset.attributes;
    }

    /// @notice Function to get array of ipfsHashes for specific assets
    /// @dev need for data parsing on frontend efficiently
    /// @param _ids is array of ids
    /// @return bytes32 array of hashes
    function getIpfsForAssets(uint [] _ids) public view returns (bytes32[]) {
        bytes32[] memory hashes = new bytes32[](_ids.length);
        for(uint i=0; i<_ids.length; i++) {
            Asset memory asset = assets[_ids[i]];
            hashes[i] = asset.ipfsHash;
        }

        return hashes;
    }

    function getAttributesForAssets(uint [] _ids) public view returns(uint[]) {
        uint[] memory attributes = new uint[](_ids.length);
        for(uint i=0; i< _ids.length; i++) {
            Asset memory asset = assets[_ids[i]];
            attributes[i] = asset.attributes;
        }
        return attributes;
    }
    ///@notice Function where all artists can withdraw their funds
    function withdraw() public {
        require(msg.sender != address(0));
        uint amount = artistBalance[msg.sender];

        msg.sender.transfer(amount);
    }


    /// @notice Function to get ipfs hash and id for all assets in one asset pack
    /// @param _assetPackId is id of asset pack
    /// @return two arrays with data
    function getAssetPackData(uint _assetPackId) public view returns(string, uint[], uint[], bytes32[]){
        require(_assetPackId < numberOfAssetPacks);

        AssetPack memory assetPack = assetPacks[_assetPackId];
        bytes32[] memory hashes = new bytes32[](assetPack.assetIds.length);

        for(uint i=0; i<assetPack.assetIds.length; i++){
            hashes[i] = getAssetIpfs(assetPack.assetIds[i]);
        }
        uint[] memory attributes = getAttributesForAssets(assetPack.assetIds);

        return(assetPack.name, assetPack.assetIds, attributes, hashes);
    }

    /// @notice Function to get name for asset pack
    /// @param _assetPackId is id of asset pack
    /// @return string name of asset pack
    function getAssetPackName(uint _assetPackId) public view returns (string) {
        require(_assetPackId < numberOfAssetPacks);

        AssetPack memory assetPack = assetPacks[_assetPackId];

        return assetPack.name;
    }

    function getAssetPackPrice(uint _assetPackId) public view returns (uint) {
        require(_assetPackId < numberOfAssetPacks);
        AssetPack memory assetPack = assetPacks[_assetPackId];

        return assetPack.price;
    }
    /// @notice Function to get cover image for every assetpack
    /// @param _packIds is array of asset pack ids
    /// @return bytes32[] array of hashes
    function getCoversForPacks(uint [] _packIds) public view returns (bytes32[]) {
        require(_packIds.length > 0);
        bytes32[] memory covers = new bytes32[](_packIds.length);
        for(uint i=0; i<_packIds.length; i++) {
            AssetPack memory assetPack = assetPacks[_packIds[i]];
            covers[i] = assetPack.packCover;
        }
        return covers;
    }


    //    function getAssetsUserHaveInPack(uint packId, address _userAddress) public view returns (uint[]) {
    //        AssetPack memory assetPack = assetPacks[packId];
    //        uint[] memory ownedAssets = new uint[](assetPack.assetIds.length);
    //        uint counter = 0;
    //        for(uint i=0; i<assetPack.assetIds.length; i++) {
    //            if(hasPermission[_userAddress][assetPack.assetIds[i]] == true) {
    //                ownedAssets[counter] = assetPack.assetIds[i];
    //            }
    //        }
    //        return ownedAssets;
    //    }
    //    /// @notice Function to get owned assets from one pack and pack size
    //    /// @param _assetPacksIds is array with ids of asset packs we need information for
    //    /// @param _userAddress is address of user we are checking this
    //    /// @return two arrays one containing how many assets we have and second containing packs size
    //    function getOwnedAssetsFromPacks(uint [] _assetPacksIds, address _userAddress) public view returns (uint[],uint[]) {
    //        uint [] memory ownedAssets = new uint[](_assetPacksIds.length);
    //        uint [] memory totalInPack = new uint[](_assetPacksIds.length);
    //        uint counter = 0;
    //        for(uint i=0; i< _assetPacksIds.length; i++) {
    //            AssetPack memory assetPack = assetPacks[_assetPacksIds[i]];
    //            for(uint j=0; j<assetPack.assetIds.length; j++) {
    //                if(hasPermission[_userAddress][assetPack.assetIds[j]] == true) {
    //                    counter++;
    //                }
    //            }
    //            ownedAssets[i] = counter;
    //            totalInPack[i] = assetPack.assetIds.length;
    //            counter = 0;
    //        }
    //
    //        return (ownedAssets, totalInPack);
    //    }
}