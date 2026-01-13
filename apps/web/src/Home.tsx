import AppGroup from "./appGroup/index.js";
import Shell from "./Shell/index.js";

const Home: React.FC = () => {
    const apps = AppGroup(); // call once

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Shell apps={apps} />
        </div>
    );
};

export default Home;