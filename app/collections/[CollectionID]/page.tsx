"use client";

import Link from "next/link";
import Image from "next/image";
import { Video } from "lucide-react";
import { useEffect, useState } from "react";
import fetchTokens from "@/lib/searchAssets";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Item } from "@/types/SearchAssetsType";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemsResponse } from "@/types/SearchAssetsType";
import { useWallet } from "@solana/wallet-adapter-react";
import SpinnerLoadingAnimation from "@/components/ui/spinnerLoadingAnimation";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";

export default function SpecificCollectionPageHome({ params }: { params: { CollectionID: string }; }) {
    const { publicKey } = useWallet();
    const [tokens, setTokens] = useState<ItemsResponse | null>(null);
    const [collectionNFTData, setCollectionNFTData] = useState<Item[] | null>(null);

    useEffect(() => {
        if (publicKey) {
            const walletAddress = publicKey.toBase58();
            fetchTokens(walletAddress).then((data) => {
                setTokens((data as unknown) as ItemsResponse);
            }).catch(console.error);
        }
        else {
            setTokens(null);
        }
    }, [publicKey])

    useEffect(() => {
        if (tokens) {
            const collectionNFTData = tokens.items.items.filter((nft) => {
                const collection = nft.grouping.find((g) => g.group_key === "collection");
                return collection && collection.group_value === params.CollectionID;
            });
            setCollectionNFTData((collectionNFTData as unknown) as Item[]);
        }
    }, [tokens, params.CollectionID]);

    console.log(collectionNFTData);

    const TotalNFTs = tokens?.items.total;

    return (
        <>
            {
                collectionNFTData?.slice(0, 1).map((nft, index) => (
                    <title key={index}>
                        {`${nft.grouping[0].collection_metadata.name} - Collections | SolSync`}
                    </title>
                ))
            }

            <div className="flex flex-row">
                <div className="basis-1/3 pt-6">
                    {
                        collectionNFTData === null ? (
                            <>
                                <Card className="flex flex-col gap-4 p-4 rounded-2xl">
                                    <Card className="p-4 flex-none rounded-xl">
                                        <Skeleton className="aspect-square border-2 object-contain w-full h-full rounded-lg" />
                                    </Card>
                                    <Card className="flex-1 rounded-xl">
                                        <CardHeader>
                                            <CardTitle>
                                                <Skeleton className="h-8" />
                                            </CardTitle>
                                            <CardDescription>
                                                <Skeleton className="h-5" />
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-4">
                                            <CardContent className="p-0">
                                                <CardTitle className="mb-2">
                                                    <Skeleton className="h-8" />
                                                </CardTitle>
                                                <Label className="text-xl">
                                                    <Skeleton className="h-6" />
                                                </Label>
                                            </CardContent>
                                            <CardContent className="p-0 flex items-end justify-end">
                                                <Skeleton className="h-10 w-44" />
                                            </CardContent>
                                        </CardContent>
                                    </Card>
                                </Card>
                            </>
                        ) : (
                            <>
                                {collectionNFTData?.slice(0, 1).map((nft, index) => (
                                    <Card key={index} className="flex flex-col gap-4 p-4 rounded-2xl">
                                        <Card className="p-4 flex-none rounded-xl">
                                            <Image
                                                width={512}
                                                height={512}
                                                src={nft.grouping[0].collection_metadata.image}
                                                alt={nft.grouping[0].collection_metadata.name}
                                                className="aspect-square border-2 object-contain w-full h-full rounded-lg"
                                            />
                                        </Card>
                                        <Card className="flex-1 rounded-xl">
                                            <CardHeader>
                                                <CardTitle>{nft.grouping[0].collection_metadata.name}</CardTitle>
                                                <CardDescription>{nft.grouping[0].collection_metadata.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-2 gap-4">
                                                <CardContent className="p-0">
                                                    <CardTitle className="mb-2">Total NFTs</CardTitle>
                                                    {
                                                        TotalNFTs === undefined ? (
                                                            <Label className="flex gap-2 text-xl">
                                                                <SpinnerLoadingAnimation size={24} />
                                                            </Label>
                                                        ) : (
                                                            <Label className="text-xl">
                                                                {collectionNFTData?.length}
                                                            </Label>
                                                        )
                                                    }
                                                </CardContent>
                                                <CardContent className="p-0 flex items-end justify-end">
                                                    <Link href="#">
                                                        <Button className="flex items-center gap-2">
                                                            Join With Huddle01
                                                            <Video />
                                                        </Button>
                                                    </Link>
                                                </CardContent>
                                            </CardContent>
                                        </Card>
                                    </Card>
                                ))}
                            </>
                        )
                    }
                </div>
            </div>
        </>
    );
}