import "./global.css"

export const metadata = {
    title: "MageKnightGPT",
    description: "The place to go for Mage Knight questions"
}

const RootLayout = ({children}) => {
    return (
        <html lang="en">
            <body> {children} </body>
        </html>
    )
}

export default RootLayout