import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { HighlightCard } from "../../components/HighlightCard";
import { TransactionCard, TransactionCardProps } from "../../components/TransactionCard";

import {
    Container,
    Header,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    UserWrapper,
    Icon,
    HighlightCards,
    Transactions,
    Tilte,
    TransactionsList,
    LogoutButton,
    LoadConatiner
} from './styles';

export interface DataListProps extends TransactionCardProps {
    id: string;
}

interface HighlightProps {
    amount: string;
    lastTransaction: string;
}
interface HighlightData {
    entries: HighlightProps;
    expensives: HighlightProps;
    total: HighlightProps;
}

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

    const theme = useTheme();

    function getLastTransactionDAte(
        collection: DataListProps[],
        type: 'positive' | 'negative'
    ) {
        const lastTransaction = new Date(
            Math.max.apply(Math, collection
                .filter(transactions => transactions.type === type)
                .map(transactions => new Date(transactions.date).getTime())))

        return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', { month: 'long' })}`;
    }

    async function LoadTransactions() {
        const dataKey = '@gofinance:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        const transactionsFormatted: DataListProps[] = transactions
            .map((item: DataListProps) => {

                if (item.type === 'positive') {
                    entriesTotal += Number(item.amount);
                } else {
                    expensiveTotal += Number(item.amount)
                }

                const amount = Number(item.amount)
                    .toLocaleString('pt-Br', {
                        style: 'currency',
                        currency: 'BRL'
                    });

                const date = Intl.DateTimeFormat('pt-Br', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                }).format(new Date(item.date));

                return {
                    id: item.id,
                    name: item.name,
                    amount,
                    type: item.type,
                    category: item.category,
                    date
                }
            });

        setTransactions(transactionsFormatted);

        const lastTransactionsEntries = getLastTransactionDAte(transactions, 'positive');
        const lastTransactionsExpensive = getLastTransactionDAte(transactions, 'negative');
        const totalInterval = `01 a ${lastTransactionsEntries}`;

        const total = entriesTotal - expensiveTotal;

        setHighlightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última entrada dia ${lastTransactionsEntries}`,
            },
            expensives: {
                amount: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última saída dia ${lastTransactionsExpensive}`,
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }),
                lastTransaction: totalInterval
            }
        });

        setIsLoading(false);
    }
    useEffect(() => {
        LoadTransactions();
    }, []);

    useFocusEffect(useCallback(() => {
        LoadTransactions();
    }, []));

    return (
        <Container>
            {
                isLoading ?
                    <LoadConatiner>
                        <ActivityIndicator
                            color={theme.colors.primary}
                            size="large"
                        />
                    </LoadConatiner> :
                    <>
                        <Header>
                            <UserWrapper>
                                <UserInfo>
                                    <Photo
                                        source={{ uri: 'https://avatars.githubusercontent.com/u/53085758?v=4' }}
                                    />
                                    <User>
                                        <UserGreeting>Olá, </UserGreeting>
                                        <UserName>Rafael</UserName>
                                    </User>
                                </UserInfo>

                                <LogoutButton onPress={() => { }}>
                                    <Icon name="power" />
                                </LogoutButton>
                            </UserWrapper>
                        </Header>

                        <HighlightCards>
                            <HighlightCard
                                type="up"
                                title="Entradas"
                                amount={highlightData?.entries?.amount}
                                lastTransaction={highlightData.entries.lastTransaction}
                            />
                            <HighlightCard
                                type="down"
                                title="Saídas"
                                amount={highlightData?.expensives?.amount}
                                lastTransaction={highlightData.expensives.lastTransaction}
                            />
                            <HighlightCard
                                type="total"
                                title="Total"
                                amount={highlightData?.total?.amount}
                                lastTransaction={highlightData.total.lastTransaction}
                            />
                        </HighlightCards>
                        <Transactions>
                            <Tilte>Listagem</Tilte>

                            <TransactionsList
                                data={transactions}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <TransactionCard data={item} />}
                            />
                        </Transactions>
                    </>
            }
        </Container>
    )

}
