const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens


describe('RealEstate', () => {
  let realEstate, escrow
  let deployer, seller
  let nftID = 1
  let purchasePrice = ether(100)
  let escrowAmount = ether(20)

  beforeEach(async () => {
    // Setup accounts
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    seller = deployer
    buyer = accounts[1]
    inspector = accounts[2]
    lender = accounts[3]

    // load contracts
    const RealEstate = await ethers.getContractFactory('RealEstate')
    const Escrow = await ethers.getContractFactory('Escrow')

    // Deploy contracts
    realEstate = await RealEstate.deploy()
    escrow = await Escrow.deploy(
    realEstate.address,
    nftID,
    purchasePrice,
    escrowAmount,
    seller.address,
    buyer.address,
    inspector.address,
    lender.address
     )

    //seller approves NFT
    transaction = await realEstate.connect(seller).approve(escrow.address, nftID)
    await transaction.wait()
    
  })


  describe('Deployment', async () => {

    it('sends an NFT to the seller / deployer', async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
    })
  })

   describe('Selling Real estate', async () => {

    it('executes a successful transaction', async () => {
      // Expects seller to be nft owner before the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)

        // Check escrow balance
      balance = await escrow.getBalance()
      console.log('escrow balance:', ethers.utils.formatEther(balance))

      //inspector update status
      transaction = await escrow.connect(inspector).updateInspectionStatus(true)
      await transaction.wait()
      console.log('Inspector updates status')

      //Buyer Approves sale
      transaction = await escrow.connect(buyer).approveSale()
      await transaction.wait()
      console.log('Buyer approves sale')

      //Seller Approves sale
      transaction = await escrow.connect(seller).approveSale()
      await transaction.wait()
      console.log('Seller approves sale')


      //Lender Approves sale
      transaction = await escrow.connect(lender).approveSale()
      await transaction.wait()
      console.log('Lender approves sale')


      //  Buyer deposist earnest
      transaction = await escrow.connect(buyer).depositEarnest({value: escrowAmount})
      await transaction.wait()
      console.log('Buyer deposit earnest money')

      //Lender funds sale
      transaction = await lender.sendTransaction({ to: escrow.address, value: ether(80) })
      console.log('lender sends the remaining amount')

      // Check escrow balance
      balance = await escrow.getBalance()
      console.log('escrow balance:', ethers.utils.formatEther(balance))

      // Finalize the sale
      transaction = await escrow.connect(buyer).finalizeSale()
      await transaction.wait()
      console.log('Buyer finalizes sale')

       // Expects buyer to be nft owner after the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)

      // Epects seller to recieve funds
      balance = await ethers.provider.getBalance(seller.address)
      console.log('seller balance:', ethers.utils.formatEther(balance))
      expect(balance).to.be.above(ether(9099))
    })
  })

})
