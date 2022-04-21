Fair mints:

start and finish at the same time for everyone
won’t accept your funds if they are out of NFTs to sell
Technically, the candy-machine is an on chain Solana program (smart contract) that governs fair mints.

metaplex is a command line tool for interacting with the candy-machine program. We will use it to:

upload your images and metadata to arweave, then register them on the solana block-chain
verify the state of your candy-machine is valid and complete
mint individual tokens with mint_one_token
metaplex upload handles more than just sending files to arweave. It will:

initialize your projects candy-machine
swap SOL for AR and send files to arweave
register those assets with your candy-machine’s inventory
Getting Started
Running candy machine command line utility
ensure you have recent versions of both node and yarn installed

clone the project – if you’re me:

$ git clone git@github.com:metaplex-foundation/metaplex.git \
  ~/metaplex-foundation/metaplex

This project is under active development. If you’re running into issues
use git pull to ensure you’re running the latest and greatest version.

install ts-node – if you’re me:
$ npm install -g ts-node

run the command line utility:
$  ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts help

Usage: candy-machine-cli [options] [command]

Options:
  -V, --version                          output the version number
  -h, --help                             display help for command

Commands:
  upload [options] <directory>
  verify [options]
  verify_price [options]
  create_candy_machine [options]
  update_candy_machine [options]
  mint_one_token [options]
  sign [options]
  sign_candy_machine_metadata [options]
  help [command]                         display help for command
Prerequisites
Read the Solana Command-line Guide
https://docs.solana.com/cli

Install the Solana Command-line Tools
https://docs.solana.com/cli/install-solana-cli-tools

devnet for the win
Devnet serves as a playground for anyone who wants to take Solana for a test drive, as a user, token holder, app developer, or NFT publisher. NFT publishers should target devnet before going for mainnet.

I highly recommend making devnet your default solana url:

solana config set --url https://api.devnet.solana.com

Create devnet wallet (for testing)
Read the fine manual
solana-keygen help new

If your me, you’ll redact your mnemonic, store it somewhere safe and take advantage of the --outfile flag.

$ solana-keygen new --outfile ~/.config/solana/devnet.json
Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the recovery seed phrase NOT the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none):

Wrote new keypair to /Users/levi/.config/solana/devnet.json
=====================================================================
pubkey: 7zMqBkHowtpEC8iayNmCoT42T8dKjikzmTbZX5aNJbhJ
=====================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
# REDACTED
=====================================================================
I also recommend making devnet your default keypair:

solana config set --keypair ~/.config/solana/devnet.json

Fund devnet wallet
First, go read the fine manuals
solana help config,
solana help balance and
solana help airdrop

If you’re me, you’re confirming your config right now to ensure you’re on devnet, because we’re going to rely on this to make subsequent command line invocations simpler from here forward. Here’s how you check it:

$ solana config get
Config File: /Users/levi/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/levi/.config/solana/devnet.json
Commitment: confirmed
And here’s how you can fund that wallet:

$ solana balance # check your initial balance
0 SOL

$ solana airdrop 10 # request funds
Requesting airdrop of 10 SOL

Signature: 2s8FE29f2fAaAoWphbiyb5b4iSKYWznLG64w93Jzx8k2DAbFGsmbyXhe3Uix8f5X6m9HRL5c6WB58j2t2WrUh88d

10 SOL

$ solana balance # confirm your balance
10 SOL
Uploading
Organizing your project assets
Here’s how you should organize the files you want to upload.

Notice that these come in numerical pairs. eg: 4.png and 4.json are two halves of the NFT – one is the art, the other is the metadata. If you have a 10k collection, then there should be 20k files in this directory.

Also notice that we’re starting with 0.json + 0.png, because that’s the default value for the --start-with. Staying close the defaults ensures you don’t have surprises like publishing fewer NFTs than you meant to.

And finally, the directory name assets doesn’t really matter. You could go with anything you like here.

$ ls assets | sort -n
0.json
0.png
1.json
1.png
2.json
2.png
3.json
3.png
4.json
4.png
5.json
5.png
6.json
6.png
7.json
7.png
8.json
8.png
9.json
9.png
# ... REDACTED
Validating your project assets
Don’t speed run this section. This is where permanent mistakes are made.

First, go read the fine manual
https://docs.metaplex.com/nft-standard

This is going to feel tedious, but remember that bugs in this data are forever. Also remember that bugs in this data determine whether you get paid or not. Be espescially careful with checking seller_fee_basis_points and properties.creators – details below:

ensure you have a recent version jq installed
check the total number of assets, json and image files confirm these add up.
$ find assets -type f  | wc -l # count the total number of asset files
      20

$ find assets -type f -name '*.json' | wc -l # count the metadata files
      10

$ find assets -type f -name '*.png' | wc -l  # count the images files
      10
      
## confirm those numbers are all what you would expect.
check image and properties.files values
## make sure your json and file name agree
## 0.json should refer to 0.png in the .image and .files props 
## 1.json should refer to 1.png in the .image and .files props 
## 2.json should refer to 2.png in the .image and .files props 
## etc
check name values
$ find assets -type f -name '*.json' |  xargs jq -r '.name' | sort | less

## this command lists then sorts all of your name values.
## for most projects, your just paging through and confirming
## the pattern looks like you'd expect it to.
check symbol values
$ find assets -type f -name '*.json' |  xargs jq -r '.symbol' | sort | uniq -c
10 YANAPE
check properties.creators
$ find assets -type f -name '*.json' | xargs jq '.properties.creators' | jq -c '.[] | [.address,.share]' | sort | uniq -c
   10 ["<address-1>",60]
   10 ["<address-2>",30]
   10 ["<address-3>",10]

## this command flattens, then counts the unique properties.creators values in your metadata.
## for most projects, you should see a consistent count across all parties (address-[1..3])

$ find assets -type f -name '*.json' | xargs jq '.properties.creators' | jq -c '.[] | [.address,.share]' | sort | uniq | jq '.[1]' | jq -s 'add'
100

## this command extends the prior command by extracting the shares & summing them up.
## you should expect this to output 100.
check seller_fee_basis_points
$ find assets -type f -name '*.json' | xargs jq '.seller_fee_basis_points' | sort | uniq -c
   10 420
   
## this command extracts unique seller_fee_basis_points, then sorts and counts them.
## for most projects you should see a consistent count across all metadata.
Uploading your project assets
Now that your wallet is funded and your assets are organized and validated we can do the fun and important part!

First, go read the fine manual
ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts help upload

Building up commands with lots of long arguments can be challenging and error prone. To avoid the pit of despair, I recommend keeping the output of these commands visible:

$ ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts help upload
Usage: candy-machine-cli upload [options] <directory>

Arguments:
  directory                  Directory containing images named from 0-n

Options:
  -e, --env <string>         Solana cluster env name (default: "devnet")
  -k, --keypair <path>       Solana wallet location (default: "--keypair not provided")
  -l, --log-level <string>   log level
  -c, --cache-name <string>  Cache file name (default: "temp")
  -n, --number <number>      Number of images to upload
  -h, --help                 display help for command
$ solana config get
Config File: /Users/levi/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/levi/.config/solana/devnet.json
Commitment: confirmed
With these visible, you can now construct the correct command line instructions for uploading to devnet. Here’s what mine looks like:

$ ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts upload ./assets --env devnet --keypair ~/.config/solana/devnet.json
Processing file: 0
Processing file: 1
Processing file: 2
Processing file: 3
Done
ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts upload sends files to arweave and also registers those files with your candy-machine. After a successful run, both arweave and Solana are initialized.

It’s normal for the ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts upload command to emit numerous errors, espescially on larger collections. The program authors are aware of this and carefully designed the program so that it’s safe to simply re-run the upload command until everything goes through completely and cleanly.

arweave is rarely able to show your your assets right away. It’s not uncommon for me to wait 10-15 minutes to see it serve images and metadata. I don’t fully understand the replication process, but know that it takes time.

Validating your candy-machine
You can confirm the health of your on-chain assets using ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts verify:

$ ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts verify
Looking at key  0
Name {redacted-name} 4 with https://arweave.net/{redacted-tx-id} checked out
Looking at key  1
Name {redacted-name} 1 with https://arweave.net/{redacted-tx-id} checked out
Looking at key  2
Name {redacted-name} 2 with https://arweave.net/{redacted-tx-id} checked out
Looking at key  3
Name {redacted-name} 3 with https://arweave.net/{redacted-tx-id} checked out
Updating your candy-machine
Set a start date and or price using:

ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/candy-machine-cli.ts \
    update_candy_machine \
    --env devnet \
    --keypair ~/.config/solana/devnet.json \
    --price 1 \
    --date "26 Sep 2021 00:12:00 GMT"
What about the web app??
There’s a boilerplate community project available here.

It is currently very new, so please report issues on GitHub.

The goal of this project is to let you:

fork it
configure it
customize your own ui
deploy it to your own mint subdomain
https://github.com/exiled-apes/candy-machine-mint

Tips
If you found this helpful, consider sending a tip to the author. NFTs welcomed :)
JUskoxS2PTiaBpxfGaAPgf3cUNhdeYFGMKdL6mZKKfR
