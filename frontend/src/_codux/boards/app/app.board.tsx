import { createBoard } from '@wixc3/react-board';
import App from '../../../components/App';

export default createBoard({
    name: 'App',
    Board: () => <App />,
    isSnippet: true,
    environmentProps: {
canvasWidth: 1046
}
});