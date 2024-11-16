import "./global.css"

export const metadata = {
    title: "ArcsGPT",
    description: "The place to go for Arcs questions"
}

const RootLayout = ({children}) => {
    return (
        <html lang="en">
            <body> {children} </body>
        </html>
    )
}

export default RootLayout