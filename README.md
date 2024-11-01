# BountyChain

BountyChain is a decentralized bounty platform that allows users to create bounties, complete them, and earn rewards in a decentralized way. It is peer-to-peer, and anyone can create a bounty and complete it. The platform is responsible for streamlining the creation and payment process by making it work in just on button click rather than the multi step in traditional processes

LIVE: [https://bountychain.xyz](https://bountychain.xyz)

## Getting Started

### Prerequisites

- Node.js
- Bun (https://bun.sh/docs/installation)

### Installation

1. Clone the repository

```bash
git clone https://github.com/Complexlity/bountychain
```

2. Install dependencies

```bash
bun install
```

3. Copy env

```bash
cp .env.sample .env
```

4. Start the server

```bash
bun run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

## Architecture

![Architecture](/architecture.png)

Here's all the components comprising the BountyChain platform:

1. **BountyContract**: This contract is responsible for creating and managing bounties. It's responsible for creating a bounty, receiving the amount of the bounty, and paying out the bounty to the winner. It's the `Source of Truth` for the BountyChain platform i.e for every save in the datbase, there must be verification of bounty information from the countract.

Currently, it's hosted on Arbitrum and Arbitrum Sepolia networks.

- Arbitrum: [0xEda8B0898DAc56ead2bC4f573C5252D3ef3d0b3c](https://arbiscan.io/address/0xEda8B0898DAc56ead2bC4f573C5252D3ef3d0b3c)
- Arbitrum Sepolia: [0x6E46796857a0E061374a0Bcb4Ce01af851773d2A](https://sepolia.arbiscan.io/address/0x6E46796857a0E061374a0Bcb4Ce01af851773d2A)

Found in the [src/](/src/features/bounties/contract/bounty.sol)

2. **Frontend and Main Server**:  The site is built with Nextjs which uses React for the frontend and Nodejs for the server routes. The server routes are responsible for saving the bounty details to the database. It's also handle submissions.

3. **Main Database**: The database is a SQLite database. Currently, it's hosted on [turso](https://turso.tech/) but can be run locally. It's responsible for storing the bounty details and submissions.


4. **Backup Server and Database**: Since the entire bounty details is not stored on the blockchain, there's always a risk of users losing funds if they create a bounty and then the main server or main database goes down or errors while the bounty is already created on the blockchain, it would be a problem. 

The backup server is resonsible for storing bounty details of failed transactions. It runs a cron job every hour to check for failed transactions and store them in the main database.

[Backup Server Repository](https://github.com/Complexlity/bountychain-backup)

For Full Explanation on Usage and Architecture, please refer to the Video Demo - 👉 [Loom Video](https://www.loom.com/share/3d4e5fcebaf247cc839f9708d061b536?sid=a44a098f-a308-45ca-bcfb-1fde3f04512c)


## Improvements
<!-- Add a markdown checkbox for some features improvements -->
- [ ] Withdraw / Cancel A Bounty
- [ ] Support for ERC20 tokens like USDC
- [ ] Token Prices In USD
- [ ] Bounty Deadline and Expiry
