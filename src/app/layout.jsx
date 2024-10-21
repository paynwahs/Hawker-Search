import { Providers } from './providers'

import './globals.css'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <div className="w-screen h-screen">{children}</div>
                </Providers>
            </body>
        </html>
    )
}
