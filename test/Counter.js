const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Counter', () => {
	let counter 

	beforeEach(async () => {
	  const Counter = await ethers.getContractFactory('Counter')
	  counter = await Counter.deploy('My Counter', 1)
	})

	describe('Deployment', () => {

	  it('sets the inital count', async () => {
	    expect(await counter.count()).to.equal(1)
	  }) 

	  it('sets the initial name', async () => {
	    expect(await counter.name()).to.equal('My Counter')
	   }) 

	})

	
})