const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^(?:(?:\+98|0)9\d{9})$/

export const validateEmail = async (_, value) => {
    if (!value) return Promise.reject('ایمیل الزامی است')
    if (!emailRegex.test(value)) return Promise.reject('ایمیل نا معتبر است')
    return Promise.resolve()
}

export const validatePhone = async (_, value) => {
    if (!value) return Promise.reject('تلفن الزامی است')
    if (!phoneRegex.test(value)) return Promise.reject('تلفن نامعتبر است')
    return Promise.resolve()
}

export const validateUsername = async (_, value) => {
    if (!value) return Promise.reject('نام کاربری را وارد کنید')
    if (!usernameRegex.test(value)) return Promise.reject('نام کاربری نامعتبر است')
    return Promise.resolve()
}

export const validatePassword = async (_, value) => {
    if (!value) return Promise.reject('رمز عبور را وارد کنید')
    if (!passwordRegex.test(value)) return Promise.reject(' رمز عبور باید ترکیبی از حروف بزرگ و کوچک، اعداد و کاراکترهای ویژه (@$!%*?&) با حداقل ۸ کاراکتر باشد')
    return Promise.resolve()
}