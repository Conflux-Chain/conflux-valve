import "TestLib.sol";

contract MetaCoin {
  TestLib.Data data;
  address public owner;

  constructor() public payable {
    owner = msg.sender;
    TestLib.Set(data, 2);
  }

  function GetData() public payable returns(uint) {
    return TestLib.Get(data);
  }
}
