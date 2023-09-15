import { useQuery } from "react-query";
import { getMovies, IGetMoviesResult } from "../api";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useState } from 'react';
import { useHistory, useRouteMatch } from "react-router-dom";

const Wrapper = styled.div`
  background-color: black;
  overflow-x: hidden;
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20vh;
`;

const Banner = styled.div<{ $bgPhoto: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7)),
    url(${(props) => props.$bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 58px;
`;

const Overview = styled.p`
  width: 50%;
  font-size: 26px;
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
`;

const Row = styled(motion.div)`
  position: absolute;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  width: 100%;
  margin-bottom: 5px;
`;

const Box = styled(motion.div)<{ $bgPhoto: string }>`
  background-color: white;
  height: 200px;
  background: url(${props => props.$bgPhoto}) no-repeat 50% 50%/cover;
  font-size: 24px;
  color: white;
  cursor: pointer;

  &:first-child {
    transform-origin: center left;
  }

  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  background-color: ${props => props.theme.black.lighter};
  opacity: 0;

  h3 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0, .5);
  opacity: 0;
`;

const MovieModal = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  background-color: ${props => props.theme.black.lighter};

  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    width: 100%;
    height: 300px;
    background-image: linear-gradient(rgba(0,0,0, 0), rgba(0,0,0, 1));
  }
`;

const ModalCover = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
`;

const ModalTitle = styled.h3`
  position: relative;
  margin-top: -80px;
  padding: 20px;
  text-align: left;
  font-size: 24px;
  color: ${props => props.theme.white.lighter};
  z-index: 1;
`;

const ModalOverview = styled.p`
  position: relative;
  padding: 0 20px;
  color: ${props => props.theme.white.lighter};
  z-index: 1;
`;

const rowVariants = {
  hidden: { x: window.innerWidth },
  visible: { x: 0 },
  exit: { x: -window.innerWidth }
}

const boxVariants = {
  normal: { scale: 1 },
  hover: { scale: 1.3, y: -50, transition: { duration: .2, delay: .5 }}
}

const infoVariants = {
  hover: { opacity: 1, transition: { duration: .2, delay: .5 } },
}

const slideOffset = 6;

function Home() {
  const history = useHistory(); // URL 사이를 (route 사이를) 이동
  const bigMovieMatch = useRouteMatch<{movieId: string}>("/movies/:movieId");
  const { data, isLoading } = useQuery<IGetMoviesResult>(["movies", "nowPlaying"], getMovies);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const { scrollY } = useScroll();
  
  const increaseIndex = () => {
    if(leaving) return;
    setLeaving(true);
    if(!data) return;
    const maxIndex = Math.floor((data.results.length - 1) / slideOffset); 
    setIndex(prev => prev === maxIndex ? 0 : prev + 1);
  }
  
  const toggleLeaving = () => setLeaving(prev => !prev);
  const onOverlayClicked = () => { history.push('/') }
  const onBoxClicked = (movieId: number) => {
    history.push(`/movies/${movieId}`);
  };

  const clickedMovie = bigMovieMatch?.params.movieId && data?.results.find((movie) => movie.id + "" === bigMovieMatch?.params.movieId);


  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            onClick={increaseIndex}
            $bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
          >
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row 
                key={index} 
                variants={rowVariants} 
                initial="hidden" 
                animate="visible" 
                exit="exit"
                transition={{ type: "linear", duration: 1 }}
                >
                {data?.results.slice(1).slice(index * slideOffset, index * slideOffset + slideOffset).map(
                  movie => 
                    <Box 
                      key={movie.id}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(movie.id)}
                      layoutId={`${movie.id}`}
                    >
                      <Info variants={infoVariants}><h3>{movie.title}</h3></Info>
                    </Box>
                )}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
          {bigMovieMatch ? 
           <>
            <Overlay 
              onClick={onOverlayClicked}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <MovieModal
              layoutId={bigMovieMatch.params.movieId} 
              style={{ top: scrollY.get() + 100 }}
            >
              {clickedMovie && 
              <>
                <ModalCover src={makeImagePath(clickedMovie.backdrop_path, "w500")} alt={`${clickedMovie.title} image`} />
                <ModalTitle>{clickedMovie.title}</ModalTitle>
                <ModalOverview>{clickedMovie.overview}</ModalOverview>
              </>}
            </MovieModal>
           </>
           : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
