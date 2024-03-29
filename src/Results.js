import React, {useEffect, useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    Cell, Avatar, Group, PanelHeader
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where,
    onSnapshot
} from "firebase/firestore";
import fireStore from "./DB";
import {element} from "prop-types";


const Results = (props) => {

    const [fullInformation, setFullInformation] = useState([])

    useEffect(async () => {

        props.sendData({
            first_name: props.userInfo.first_name,
            last_name: props.userInfo.last_name,
            bestScore: Number(localStorage.getItem('bestScore')),
            id: props.userInfo.id
        })

        const tempArr = []
        // const ref = query(collection(fireStore, 'users'))
        // const q = query(collection(fireStore, "users"), where("bestScore", "!=", -1));
        const q = query(collection(fireStore, "users"), orderBy('bestScore', 'desc'), limit(50));

        // console.log("ref", ref)
        // console.log("q", q)

        const topId = []
        let topBestScore = []

        let inf = await props.reciveData(q)

        inf.forEach((el) => {
            topId.push(el.data().id)
            topBestScore.push(el.data().bestScore)
        })


        console.log(inf)


        bridge.send("VKWebAppCallAPIMethod", {
            "method": "users.get",
            "request_id": "32test",
            "params": {
                "user_ids": topId.join(','),
                "v": "5.131",
                "fields": "photo_100",
                "access_token": "43d622264f5270475b941c24bc117d252490fe0d97ef581ec7b44321cb1f3df7aa970bf00bc50d4e641db"
            }
        }).then((data) => {
            // console.log("data", data)

            data.response.map((el, i) => {
                tempArr.push({
                    id: el.id, first_name: el.first_name,
                    last_name: el.last_name, ava: el.photo_100, bestScore: topBestScore[i]
                })
            })

            console.log("tempArr", tempArr)
            console.log("topBestScore", topBestScore)

            setFullInformation(tempArr)
            // fullInformation.length = 0
        }).catch((error) => {
            // Ошибка
            console.error(error);
        })


    }, [])

    return (
        <React.Fragment>
            <PanelHeader>Лучшие игроки</PanelHeader>
            <Group>
                {fullInformation.map(
                    (v, i) => {
                        console.log("key=", i)
                        return <Cell key={i} before={<Avatar src={v.ava}></Avatar>}
                                     after={'Total: ' + v.bestScore}>{v.first_name + ' ' + v.last_name}</Cell>
                    }
                )}
            </Group>
        </React.Fragment>
    )
}

export default Results