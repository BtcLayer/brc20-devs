package taprootassets

import (
	"fmt"
	"log"

	"github.com/btcsuite/btcd/chaincfg"
	"github.com/btcsuite/btcd/rpcclient"
	"github.com/btcsuite/btcd/txscript"
	"github.com/btcsuite/btcd/wire"
)


func main() {

    connConfig := &rpcclient.ConnConfig{
		Host:         "127.0.0.1:18332", // Testnet RPC host and port
		User:         "our_rpc_user",
		Pass:         "our_rpc_password",
		HTTPPostMode: true,
		DisableTLS:   true,
	}

    client, err := rpcclient.New(connConfig, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Shutdown()


	// Create a new Bitcoin transaction
	tx := wire.NewMsgTx(wire.TxVersion)

	// Define the recipient's address
	recipientAddress := "bc1q2p8xa69u29z6gwpsr3mfdd0q35fs3q3asnd9km"

	// Create the locking script (P2TR) using Taproot
	builder := txscript.NewScriptBuilder()
	builder.AddOp(txscript.OP_IF)
	builder.AddData([]byte{0x00}) // This is where your Tapscript goes
	builder.AddOp(txscript.OP_CHECKSIG)
	builder.AddOp(txscript.OP_ELSE)
	builder.AddData([]byte{0x01}) // This is the alternate branch (e.g., timelock condition)
	builder.AddOp(txscript.OP_CHECKSEQUENCEVERIFY)
	builder.AddOp(txscript.OP_DROP)
	builder.AddOp(txscript.OP_CHECKSIG)
	builder.AddOp(txscript.OP_ENDIF)

	lockingScript, err := builder.Script()
	if err != nil {
		log.Fatal(err)
	}

	// Create a Pay-to-Taproot (P2TR) output
	pkScript, err := txscript.PayToAddrScript(recipientAddress)
	if err != nil {
		log.Fatal(err)
	}

	// Set the output amount and locking script
	txOut := wire.NewTxOut(1000000, pkScript) // Amount in satoshis (e.g., 0.01 BTC)
	tx.AddTxOut(txOut)

	// Sign the transaction (not shown in this simplified example)
    txHash := tx.TxHash()
	sigScript, err := txscript.SignatureScript(tx, 0, pkScript, txscript.SigHashAll, nil)
	if err != nil {
		log.Fatal(err)
	}
	tx.TxIn[0].SignatureScript = sigScript

	// Serialize the transaction
	serializedTx, err := tx.Bytes()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Serialized Transaction: %x\n", serializedTx)

    // Send the transaction to the Bitcoin network
	txid, err := client.SendRawTransaction(tx, true)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Transaction sent with TXID: %s\n", txid)
}


