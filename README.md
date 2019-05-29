# B9Lab Community Blockstars 2019 - Ethereum Developer Course
# Remittance Project

You will create a smart contract named Remittance whereby:
- there are three people: Alice, Bob & Carol.
- Alice wants to send funds to Bob, but she only has ether & Bob does not care about Ethereum and wants to be paid in local currency.
- luckily, Carol runs an exchange shop that converts ether to local currency.
- Therefore, to get the funds to Bob, Alice will allow the funds to be transferred through Carol's exchange shop. Carol will collect the ether from Alice and give the local currency to Bob.

The steps involved in the operation are as follows:
- Alice creates a Remittance contract with Ether in it and a puzzle.
- Alice sends a one-time-password to Bob; over SMS, say.
- Alice sends another one-time-password to Carol; over email, say.
- Bob treks to Carol's shop.
- Bob gives Carol his one-time-password.
- Carol submits both passwords to Alice's remittance contract.
- Only when both passwords are correct does the contract yield the Ether to Carol.
- Carol gives the local currency to Bob.
- Bob leaves.
- Alice is notified that the transaction went through.
- Since they each have only half of the puzzle, Bob & Carol need to meet in person so they can supply both passwords to the contract. This is a security measure. It may help to understand this use-case as similar to a 2-factor authentication.

Stretch goals:
- did you implement the basic specs airtight, without any exploit, before ploughing through the stretch goals?
- add a deadline, after which Alice can claim back the unchallenged Ether
- add a limit to how far in the future the deadline can be
- add a kill switch to the whole contract
- plug a security hole (which one?) by changing one password to the recipient's address
- make the contract a utility that can be used by David, Emma and anybody with an address
- make you, the owner of the contract, take a cut of the Ethers smaller than what it would cost Alice to deploy the same contract herself
- did you degrade safety in the name of adding features?

## Getting Started

Clone this repository locally:

```bash or cmd
git clone https://github.com/theTechRebel/remittance.git
```

Install dependencies with npm :

```bash or cmd
npm install
```

Build the App with webpack-cli:

(for windows)
```bash or cmd
.\node_modules\.bin\webpack-cli --mode development
```
(for unix):
```bash or cmd
./node_modules/.bin/webpack-cli --mode development
```
Start Ganache and launch a quickstart testnet

Deploy the smart contract onto your Ganache blockchain:

```bash or cmd
truffle migrate
```
Fire up an http server for development
```bash or cmd
npx http-server ./build/app/ -a 0.0.0.0 -p 8000 -c-1
```
Open the app in your browser with a Meta Mask plugin installed (preferably)

http://127.0.0.1:8000/index.html

