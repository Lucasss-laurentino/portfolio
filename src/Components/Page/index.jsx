import { Footer } from '../Footer';
import { Header } from '../Header';
import { Projects } from '../Projects';
import { Dino } from '../Dino';
import { Skills } from '../Skills';
import './index.css';

export const Page = () => {
    return (
        <>
            <Header />
            <Skills />
            <Projects/>
            <Footer/>
        </>
    )
}