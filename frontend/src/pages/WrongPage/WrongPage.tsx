export const WrongPage=()=>{
    return <div style={{
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center',
        margin: '50px',
        color: '#444',
    }}>
        <h1 style={ {
            fontSize: '3em',
            color: '#ff6347',
            marginBottom: '10px',
        }}>404 - Page Not Found</h1>
        <p style={{
            fontSize: '1.2em',
            color: '#777',
        }}>Oops! The requested URL was not found on this server.</p>
    </div>
}