"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import fetchTokens from "@/lib/searchAssets";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { ItemsResponse } from "@/types/SearchAssetsType";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function Home() {
    const { publicKey } = useWallet();
    const [page, setPage] = useState(0);
    const [groupDataValues, setGroupDataValues] = useState<any[]>([]);
    const [tokens, setTokens] = useState<ItemsResponse | null>(null);

    const perPage = 8;

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
        const groupDataValue = new Set<any>();
        tokens?.items.items.map((item) => {
            item.grouping.forEach((group) => {
                groupDataValue.add(group.group_value)
            });
        });
        setGroupDataValues(Array.from(groupDataValue));
    }, [tokens?.items.items])

    const pageNavigation = (page: number) => {
        return tokens?.items.items.slice(page * perPage, (page + 1) * perPage);
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {
                            publicKey?.toBase58() === undefined ? (
                                <Label className="text-xl">
                                    Connect Wallet to view your address
                                </Label>
                            ) : (
                                <Label className="text-xl">
                                    {publicKey?.toBase58()}
                                </Label>
                            )
                        }
                    </CardContent>
                </Card>

                {
                    publicKey?.toBase58() === undefined ? (
                        null
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Total NFTs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {
                                    tokens?.items.total === undefined ? (
                                        <Label className="flex gap-2 text-xl">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="animate-spin h-6 w-6 text-primary-500"
                                            >
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                            Loading...
                                        </Label>
                                    ) : (
                                        <>
                                            <Label className="text-xl">
                                                {tokens?.items.total}
                                            </Label>
                                        </>
                                    )
                                }
                            </CardContent>
                        </Card>
                    )
                }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {pageNavigation(page)?.map((item, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{item.content.metadata.name}</CardTitle>
                            <CardDescription>{item.grouping[0].collection_metadata.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Image src={item.content.files[0].uri} width={512} height={512} alt={item.content.metadata.name} className="aspect-square border-2 object-contain w-full h-full rounded-md" />
                        </CardContent>
                    </Card>
                ))}

                {tokens?.items.items.length === 0 && (
                    <div className="col-span-full flex justify-center items-center">
                        <Label className="text-xl text-red-400">
                            No NFTs found
                        </Label>
                    </div>
                )}

                {tokens?.items.items.length! > 0 && (
                    <div className="col-span-full flex justify-center items-center">
                        <Button
                            variant="ghost"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeftIcon className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        <Label className="ml-8">{page + 1}</Label>
                        <Label className="mx-4">/</Label>
                        <Label className="mr-8">{Math.floor(tokens?.items.total! / perPage) + 1}</Label>
                        <Button
                            variant="ghost"
                            onClick={() => setPage(page + 1)}
                            disabled={page === Math.floor(tokens?.items.total! / perPage)}
                        >
                            Next
                            <ChevronRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <pre>{JSON.stringify(groupDataValues, null, 2)}</pre>
            {/* <pre>{JSON.stringify(tokens?.items.items.slice(0, 1), null, 2)}</pre> */}
        </>
    );
}
