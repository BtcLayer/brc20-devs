package main

import (
	"encoding/hex"
	"fmt"

	"github.com/lightninglabs/taproot-assets/taprpc/zkrpc"
	"github.com/urfave/cli"
)

var zkCommands = []cli.Command{
	{
		Name:      "zk",
		ShortName: "z",
		Usage:     "Interact with zk module.",
		Category:  "ZK",
		Subcommands: []cli.Command{
			createZkProofCommand,
			listAssetsCommand,
			listUtxosCommand,
			listGroupsCommand,
			listAssetBalancesCommand,
			sendAssetsCommand,
			listTransfersCommand,
			fetchMetaCommand,
		},
	},
}

var (
	zkProof             = "prrof"
	zkProofTime         = "time"
	zkshortResponseName = "short"
)

var createZkProofCommand = cli.Command{
	Name:        "createproof",
	ShortName:   "c",
	Usage:       "create a new proof",
	Description: "Attempt to create a new proof with the specified parameters",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  zkProof,
			Usage: "the dummy proof",
		},
		cli.StringFlag{
			Name:  zkProofTime,
			Usage: "the time proof is created",
		},
		cli.BoolFlag{
			Name: zkshortResponseName,
			Usage: "if true, then the current assets within the " +
				"batch will not be returned in the response " +
				"in order to avoid printing a large amount " +
				"of data in case of large batches",
		},
	},
	Action: createProof,
	Subcommands: []cli.Command{
		listBatchesCommand,
		finalizeBatchCommand,
		cancelBatchCommand,
	},
}

// func parseAssetType(ctx *cli.Context) taprpc.AssetType {
// 	assetType := taprpc.AssetType_NORMAL
// 	if ctx.String(assetTypeName) == "collectible" {
// 		assetType = taprpc.AssetType_COLLECTIBLE
// 	}

// 	return assetType
// }

func createProof(ctx *cli.Context) error {
	// switch {
	// case ctx.String(assetTagName) == "":
	// 	fallthrough
	// case ctx.Int64(assetSupplyName) == 0:
	// 	return cli.ShowSubcommandHelp(ctx)
	// }

	// var (
	// 	groupKey    []byte
	// 	err         error
	// 	groupKeyStr = ctx.String(assetGroupKeyName)
	// )

	// if len(groupKeyStr) != 0 {
	// 	groupKey, err = hex.DecodeString(groupKeyStr)
	// 	if err != nil {
	// 		return fmt.Errorf("invalid group key")
	// 	}
	// }

	// Both the meta bytes and the meta path can be set.
	// var assetMeta *taprpc.AssetMeta
	// switch {
	// case ctx.String(assetMetaBytesName) != "" &&
	// 	ctx.String(assetMetaFilePathName) != "":
	// 	return fmt.Errorf("meta bytes or meta file path cannot " +
	// 		"be both set")

	// case ctx.String(assetMetaBytesName) != "":
	// 	assetMeta = &taprpc.AssetMeta{
	// 		Data: []byte(ctx.String(assetMetaBytesName)),
	// 		Type: taprpc.AssetMetaType(ctx.Int(assetMetaTypeName)),
	// 	}

	// case ctx.String(assetMetaFilePathName) != "":
	// 	metaPath := tapcfg.CleanAndExpandPath(
	// 		ctx.String(assetMetaFilePathName),
	// 	)
	// 	metaFileBytes, err := os.ReadFile(metaPath)
	// 	if err != nil {
	// 		return fmt.Errorf("unable to read meta file: %w", err)
	// 	}

	// 	assetMeta = &taprpc.AssetMeta{
	// 		Data: metaFileBytes,
	// 		Type: taprpc.AssetMetaType(ctx.Int(assetMetaTypeName)),
	// 	}
	// }

	ctxc := getContext()
	client, cleanUp := getZKClient(ctx)
	defer cleanUp()

	resp, err := client.CreateProof(ctxc, &zkrpc.CreateProofRequest{
		Zkproof: &zkrpc.ZkProof{Proof: zkProof,
			Time: zkProofTime,
		},
		ShortResponse: ctx.Bool(shortResponseName),
	})
	if err != nil {
		return fmt.Errorf("unable to create proof: %w", err)
	}

	printRespJSON(resp)
	return nil
}

var zkfinalizeBatchCommand = cli.Command{
	Name:        "finalize",
	ShortName:   "f",
	Usage:       "finalize a batch",
	Description: "Attempt to finalize a pending batch.",
	Flags: []cli.Flag{
		cli.BoolFlag{
			Name: shortResponseName,
			Usage: "if true, then the current assets within the " +
				"batch will not be returned in the response " +
				"in order to avoid printing a large amount " +
				"of data in case of large batches",
		},
	},
	Action: zkfinalizeBatch,
}

func zkfinalizeBatch(ctx *cli.Context) error {
	ctxc := getContext()
	client, cleanUp := getZKClient(ctx)
	defer cleanUp()

	resp, err := client.FinalizeBatch(ctxc, &zkrpc.FinalizeBatchRequest{
		ShortResponse: ctx.Bool(shortResponseName),
	})
	if err != nil {
		return fmt.Errorf("unable to finalize batch: %w", err)
	}

	printRespJSON(resp)
	return nil
}

var zkcancelBatchCommand = cli.Command{
	Name:        "cancel",
	ShortName:   "c",
	Usage:       "cancel a batch",
	Description: "Attempt to cancel a pending batch.",
	Action:      zkcancelBatch,
}

func zkcancelBatch(ctx *cli.Context) error {
	ctxc := getContext()
	client, cleanUp := getZKClient(ctx)
	defer cleanUp()

	resp, err := client.CancelBatch(ctxc, &zkrpc.CancelBatchRequest{})
	if err != nil {
		return fmt.Errorf("unable to cancel batch: %w", err)
	}

	printRespJSON(resp)
	return nil
}

var zklistBatchesCommand = cli.Command{
	Name:        "batches",
	ShortName:   "b",
	Usage:       "list all batches",
	Description: "List all batches",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  batchKeyName,
			Usage: "if set, the batch key for a specific batch",
		},
	},
	Action: listBatches,
}

func zklistBatches(ctx *cli.Context) error {
	ctxc := getContext()
	client, cleanUp := getZKClient(ctx)
	defer cleanUp()

	var (
		batchKeyStr = ctx.String(batchKeyName)
		batchKey    []byte
		err         error
	)
	if len(batchKeyStr) != 0 {
		batchKey, err = hex.DecodeString(batchKeyStr)
		if err != nil {
			return fmt.Errorf("invalid batch key")
		}
	}

	resp, err := client.ListBatches(ctxc, &zkrpc.ListBatchRequest{
		Filter: &zkrpc.ListBatchRequest_BatchKey{
			BatchKey: batchKey,
		},
	})
	if err != nil {
		return fmt.Errorf("unable to list batches: %w", err)
	}

	printRespJSON(resp)
	return nil
}

// var zklistAssetsCommand = cli.Command{
// 	Name:        "list",
// 	ShortName:   "l",
// 	Usage:       "list all proofs",
// 	Description: "list all pending and created proofs",
// 	Flags: []cli.Flag{
// 		cli.BoolFlag{
// 			Name:  assetShowWitnessName,
// 			Usage: "include the prrofs witness data",
// 		},
// 		cli.BoolFlag{
// 			Name:  assetShowSpentName,
// 			Usage: "include fully crreated proofs in the list",
// 		},
// 	},
// 	Action: zklistAssets,
// }

// func zklistAssets(ctx *cli.Context) error {
// 	ctxc := getContext()
// 	client, cleanUp := getClient(ctx)
// 	defer cleanUp()

// 	// TODO(roasbeef): need to reverse txid

// 	resp, err := client.ListAssets(ctxc, &taprpc.ListAssetRequest{
// 		WithWitness:  ctx.Bool(assetShowWitnessName),
// 		IncludeSpent: ctx.Bool(assetShowSpentName),
// 	})
// 	if err != nil {
// 		return fmt.Errorf("unable to list assets: %w", err)
// 	}
// 	printRespJSON(resp)
// 	return nil
// }

// var listUtxosCommand = cli.Command{
// 	Name:        "utxos",
// 	ShortName:   "u",
// 	Usage:       "list all utxos",
// 	Description: "list all utxos managing assets",
// 	Action:      listUtxos,
// }

// func listUtxos(ctx *cli.Context) error {
// 	ctxc := getContext()
// 	client, cleanUp := getClient(ctx)
// 	defer cleanUp()

// 	resp, err := client.ListUtxos(ctxc, &taprpc.ListUtxosRequest{})
// 	if err != nil {
// 		return fmt.Errorf("unable to list utxos: %w", err)
// 	}
// 	printRespJSON(resp)
// 	return nil
// }

// var listGroupsCommand = cli.Command{
// 	Name:        "groups",
// 	ShortName:   "g",
// 	Usage:       "list all asset groups",
// 	Description: "list all asset groups known to the daemon",
// 	Action:      listGroups,
// }

// func listGroups(ctx *cli.Context) error {
// 	ctxc := getContext()
// 	client, cleanUp := getClient(ctx)
// 	defer cleanUp()

// 	resp, err := client.ListGroups(ctxc, &taprpc.ListGroupsRequest{})
// 	if err != nil {
// 		return fmt.Errorf("unable to list asset groups: %w", err)
// 	}
// 	printRespJSON(resp)
// 	return nil
// }

// var listAssetBalancesCommand = cli.Command{
// 	Name:        "balance",
// 	ShortName:   "b",
// 	Usage:       "list asset balances",
// 	Description: "list balances for all assets or a selected asset",
// 	Action:      listAssetBalances,
// 	Flags: []cli.Flag{
// 		cli.BoolFlag{
// 			Name:  groupByGroupName,
// 			Usage: "Group asset balances by group key",
// 		},
// 		cli.StringFlag{
// 			Name: assetIDName,
// 			Usage: "A specific asset ID to run the balance query " +
// 				"against",
// 		},
// 		cli.StringFlag{
// 			Name: groupKeyName,
// 			Usage: "A specific asset group key to run the " +
// 				"balance query against. Must be used " +
// 				"together with --by_group",
// 		},
// 	},
// }

// func listAssetBalances(ctx *cli.Context) error {
// 	ctxc := getContext()
// 	client, cleanUp := getClient(ctx)
// 	defer cleanUp()

// 	var err error

// 	req := &taprpc.ListBalancesRequest{}

// 	if !ctx.Bool(groupByGroupName) {
// 		req.GroupBy = &taprpc.ListBalancesRequest_AssetId{
// 			AssetId: true,
// 		}

// 		assetIDHexStr := ctx.String(assetIDName)
// 		if len(assetIDHexStr) != 0 {
// 			req.AssetFilter, err = hex.DecodeString(assetIDHexStr)
// 			if err != nil {
// 				return fmt.Errorf("invalid asset ID")
// 			}

// 			if len(req.AssetFilter) != 32 {
// 				return fmt.Errorf("invalid asset ID length")
// 			}
// 		}
// 	} else {
// 		req.GroupBy = &taprpc.ListBalancesRequest_GroupKey{
// 			GroupKey: true,
// 		}

// 		assetGroupKeyHexStr := ctx.String(groupKeyName)
// 		req.GroupKeyFilter, err = hex.DecodeString(assetGroupKeyHexStr)
// 		if err != nil {
// 			return fmt.Errorf("invalid group key")
// 		}
// 	}

// 	resp, err := client.ListBalances(ctxc, req)
// 	if err != nil {
// 		return fmt.Errorf("unable to list asset balances: %w", err)
// 	}

// 	printRespJSON(resp)
// 	return nil
// }

// var sendAssetsCommand = cli.Command{
// 	Name:        "send",
// 	ShortName:   "s",
// 	Usage:       "send an asset",
// 	Description: "send asset w/ a taproot asset addr",
// 	Flags: []cli.Flag{
// 		cli.StringSliceFlag{
// 			Name: addrName,
// 			Usage: "addr to send to; can be specified multiple " +
// 				"times to send to multiple addresses at once",
// 		},
// 		// TODO(roasbeef): add arg for file name to write sender proof
// 		// blob
// 	},
// 	Action: sendAssets,
// }

// func sendAssets(ctx *cli.Context) error {
// 	addrs := ctx.StringSlice(addrName)
// 	if ctx.NArg() != 0 || ctx.NumFlags() == 0 || len(addrs) == 0 {
// 		return cli.ShowSubcommandHelp(ctx)
// 	}

// 	ctxc := getContext()
// 	client, cleanUp := getClient(ctx)
// 	defer cleanUp()

// 	resp, err := client.SendAsset(ctxc, &taprpc.SendAssetRequest{
// 		TapAddrs: addrs,
// 	})
// 	if err != nil {
// 		return fmt.Errorf("unable to send assets: %w", err)
// 	}

// 	printRespJSON(resp)
// 	return nil
// }

// var listTransfersCommand = cli.Command{
// 	Name:      "transfers",
// 	ShortName: "t",
// 	Usage:     "list asset transfers",
// 	Description: "list outgoing transfers of all assets or a selected " +
// 		"asset",
// 	Action: listTransfers,
// 	Flags: []cli.Flag{
// 		cli.StringFlag{
// 			Name: assetIDName,
// 			Usage: "A specific asset ID to list outgoing " +
// 				"transfers for",
// 		},
// 	},
// }

// func listTransfers(ctx *cli.Context) error {
// 	ctxc := getContext()
// 	client, cleanUp := getClient(ctx)
// 	defer cleanUp()

// 	req := &taprpc.ListTransfersRequest{}
// 	resp, err := client.ListTransfers(ctxc, req)
// 	if err != nil {
// 		return fmt.Errorf("unable to list asset transfers: %w", err)
// 	}

// 	printRespJSON(resp)
// 	return nil
// }

// const (
// 	metaName = "asset_meta"
// )

// var fetchMetaCommand = cli.Command{
// 	Name:  "meta",
// 	Usage: "fetch asset meta",
// 	Description: "fetch the meta bytes for an asset based on the " +
// 		"asset_id or meta_hash",
// 	Action: fetchMeta,
// 	Flags: []cli.Flag{
// 		cli.StringFlag{
// 			Name:  assetIDName,
// 			Usage: "asset_id to fetch meta for",
// 		},
// 		cli.StringFlag{
// 			Name:  metaName,
// 			Usage: "meta_hash to fetch meta for",
// 		},
// 	},
// }

// func fetchMeta(ctx *cli.Context) error {
// 	switch {
// 	case ctx.IsSet(metaName) && ctx.IsSet(assetIDName):
// 		return fmt.Errorf("only the asset_id or meta_hash can be set")

// 	case !ctx.IsSet(assetIDName) && !ctx.IsSet(metaName):
// 		return cli.ShowSubcommandHelp(ctx)
// 	}

// 	ctxc := getContext()
// 	client, cleanUp := getClient(ctx)
// 	defer cleanUp()

// 	req := &taprpc.FetchAssetMetaRequest{}
// 	if ctx.IsSet(assetIDName) {
// 		assetIDHex, err := hex.DecodeString(ctx.String(assetIDName))
// 		if err != nil {
// 			return fmt.Errorf("invalid asset ID")
// 		}

// 		req.Asset = &taprpc.FetchAssetMetaRequest_AssetId{
// 			AssetId: assetIDHex,
// 		}
// 	} else {
// 		metaBytes, err := hex.DecodeString(ctx.String(metaName))
// 		if err != nil {
// 			return fmt.Errorf("invalid meta hash")
// 		}

// 		req.Asset = &taprpc.FetchAssetMetaRequest_MetaHash{
// 			MetaHash: metaBytes,
// 		}
// 	}

// 	resp, err := client.FetchAssetMeta(ctxc, req)
// 	if err != nil {
// 		return fmt.Errorf("unable to fetch asset meta: %w", err)
// 	}

// 	printRespJSON(resp)
// 	return nil
// }
