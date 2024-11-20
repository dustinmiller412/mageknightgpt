import "./global.css"

export const metadata = {
    title: "DnDGPT",
    description: "The place to go for DnD 5e questions"
}

const RootLayout = ({children}) => {
    return (
        <html lang="en">
            <body> {children} </body>
        </html>
    )
}

export default RootLayout