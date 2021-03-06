import React, { useState, useEffect } from 'react';
import { useStateValue } from '../StateProvider';
import db from '../firebase';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '../components/MainArea/Loader';
import Picture from '../components/MainArea/Picture';
import styled from 'styled-components';
import DefaultArea from './DefaultArea';
import FlipMove from 'react-flip-move';
import DetailPage from '../components/Detail/DetailPage';

const Container = styled.div`
    position: relative;
    z-index: 1;
    margin-bottom: 14px;
    margin-top: -20px;
`;

const BackgroundImage = styled.div`
    width: 100%;
    height: 787px;
    background-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 100) 0,
            rgba(25, 25, 25, 0) 20%,
            rgba(25, 25, 25, 0) 20%,
            rgba(0, 0, 0, 0) 66.66%,
            rgba(0, 0, 0, 0) 66.66%,
            rgba(0, 0, 0, 50) 100%
        ),
        url(${(props) => props.bg});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
`;

const TitleContainer = styled.div`
    position: absolute;
    left: 240px;
    bottom: 340px;
`;

const Title = styled.h1`
    font-size: 70px;
    font-weight: bold;
    font-style: normal;
    line-height: 101px;
    letter-spacing: -1.4px;
    margin-bottom: 41px;
`;

const ReviewButton = styled.button`
    width: 215px;
    height: 45px;
    color: #ffffff;
    font-size: 24px;
    line-height: 35px;
    letter-spacing: 0.48px;
    background-color: transparent;
    border: 2px solid #ffffff;
    border-radius: 28px;
    cursor: pointer;
    outline: none;
`;

const MarginContainer = styled.div`
    position: relative;
    z-index: 100;
    max-width: 1440px;
    margin: auto;
    margin-top: -90px;
`;

const HeaderContainer = styled.header`
    display: flex;
    justify-content: flex-end;
`;

const MoodList = styled.ul`
    display: flex;
`;

const Mood = styled.li`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 46px;
    margin-left: 20px;
    box-sizing: border-box;
    color: ${(props) => (props.active ? '#ff534b' : '')};
    cursor: pointer;
    font-style: normal;
    font-weight: 300;
    font-size: 24px;
    line-height: 35px;
    letter-spacing: -0.48px;
    &:hover {
        color: #ff534b;
        transition: color 300ms ease-out;
    }
`;

const ScrollContainer = styled.div`
    width: 1440px;
    margin: 36px 0;
    columns: 3;
    column-gap: 40px;
`;

function Area() {
    const [{ term }] = useStateValue();
    const [last, setLast] = useState(null);
    const [posts, setPosts] = useState([]);
    const [mood, setMood] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const moods = ['도시', '자연', '몽환', '여유', '고요', '활기', '낭만'];

    useEffect(() => {
        setPosts([]);
        const unsubscribe = db
            .collection('posts')
            .orderBy('timestamp', 'desc')
            .where('area', '==', term)
            .limit(10)
            .onSnapshot((snapshot) => {
                if (snapshot.empty) {
                    setHasMore(false);
                    return;
                }
                setPosts(
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        post: doc.data(),
                    }))
                );
                setLast(snapshot.docs[snapshot.docs.length - 1]);
            });

        return () => {
            unsubscribe();
        };
    }, [term]);

    const next = () => {
        if (last) {
            db.collection('posts')
                .orderBy('timestamp', 'desc')
                .where('area', '==', term)
                .startAfter(last)
                .limit(10)
                .onSnapshot((snapshot) => {
                    if (snapshot.empty) {
                        setHasMore(false);
                        return;
                    }
                    setPosts([
                        ...posts,
                        ...snapshot.docs.map((doc) => ({
                            id: doc.id,
                            post: doc.data(),
                        })),
                    ]);
                    setLast(snapshot.docs[snapshot.docs.length - 1]);
                });
        }
    };

    const moodNext = () => {
        if (last) {
            db.collection('posts')
                .orderBy('timestamp', 'desc')
                .where('area', '==', term)
                .where('mood', '==', mood)
                .startAfter(last)
                .limit(10)
                .onSnapshot((snapshot) => {
                    if (snapshot.empty) {
                        setHasMore(false);
                        return;
                    }
                    setPosts([
                        ...posts,
                        ...snapshot.docs.map((doc) => ({
                            id: doc.id,
                            post: doc.data(),
                        })),
                    ]);
                    setLast(snapshot.docs[snapshot.docs.length - 1]);
                });
        }
    };

    const onMoodChange = (e) => {
        setMood(e.currentTarget.innerText);
        setPosts([]);

        db.collection('posts')
            .orderBy('timestamp', 'desc')
            .where('area', '==', term)
            .where('mood', '==', e.currentTarget.innerText)
            .limit(10)
            .onSnapshot((snapshot) => {
                setPosts(
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        post: doc.data(),
                    }))
                );
                setLast(snapshot.docs[snapshot.docs.length - 1]);
            });
    };
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onClose = () => {
        setIsModalOpen(false);
    };
    return (
        <>
            {posts[0] && (
                <div>
                    <DetailPage
                        open={isModalOpen}
                        close={onClose}
                        id={posts[0].id}
                        advertising={posts[0].post.advertising}
                        area={posts[0].post.area}
                        avatar={posts[0].post.avatar}
                        heart={posts[0].post.heart}
                        imageUrl={posts[0].post.imageUrl}
                        latitude={posts[0].post.latitude}
                        longitude={posts[0].post.longitude}
                        mood={posts[0].post.mood}
                        novelty={posts[0].post.novelty}
                        rating={posts[0].post.rating}
                        review={posts[0].post.review}
                        timestamp={posts[0].post.timestamp}
                        title={posts[0].post.title}
                        username={posts[0].post.username}
                        address={posts[0].post.address}
                        uid={posts[0].post.uid}
                    />
                    <Container>
                        <BackgroundImage bg={posts[0]?.post?.imageUrl} />
                        <TitleContainer>
                            <Title>{term}의 여행지들</Title>
                            <ReviewButton onClick={() => setIsModalOpen(true)}>
                                배경 리뷰 보기
                            </ReviewButton>
                        </TitleContainer>
                    </Container>
                    <MarginContainer>
                        <HeaderContainer>
                            <MoodList>
                                {moods.map((moodText) => (
                                    <Mood
                                        key={moodText}
                                        onClick={onMoodChange}
                                        active={
                                            moodText === mood ? true : false
                                        }
                                    >
                                        {moodText}
                                    </Mood>
                                ))}
                            </MoodList>
                        </HeaderContainer>

                        <InfiniteScroll
                            dataLength={posts.length}
                            next={(mood && moodNext) || next}
                            hasMore={hasMore}
                            loader={<Loader />}
                        >
                            <ScrollContainer>
                                <FlipMove>
                                    {posts.map(({ post, id }, index) => (
                                        <Picture
                                            uid={post.uid}
                                            id={id}
                                            key={index}
                                            advertising={post.advertising}
                                            area={post.area}
                                            avatar={post.avatar}
                                            heart={post.heart}
                                            imageUrl={post.imageUrl}
                                            latitude={post.latitude}
                                            longitude={post.longitude}
                                            mood={post.mood}
                                            novelty={post.novelty}
                                            rating={post.rating}
                                            review={post.review}
                                            timestamp={post.timestamp}
                                            title={post.title}
                                            username={post.username}
                                            address={post.address}
                                        />
                                    ))}
                                </FlipMove>
                            </ScrollContainer>
                        </InfiniteScroll>
                    </MarginContainer>
                </div>
            )}
            {!posts[0] && <DefaultArea />}
        </>
    );
}
export default Area;
