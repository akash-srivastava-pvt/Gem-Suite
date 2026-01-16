import AppGroup from "./appGroup/index.js";
import Shell from "./Shell/index.js";
import { ShellProvider } from "./context/ShellContext.js";

const Home: React.FC = () => {
    const apps = AppGroup(); // call once

    return (
        <ShellProvider>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Shell apps={apps} />
            </div>
        </ShellProvider>
    );
};

export default Home;