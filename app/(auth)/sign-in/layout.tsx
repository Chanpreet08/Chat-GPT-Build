import React from "react";


const AuthLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <section className="flex flex-col items-center justify-center h-screen">
            <div className="w-full max-w-md">
                {children}
            </div>
        </section>
    )
}

export default AuthLayout;