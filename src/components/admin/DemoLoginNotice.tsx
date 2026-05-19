'use client'

import { useEffect, useState } from 'react'
import './DemoLoginNotice.scss'

export function DemoLoginNotice() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isLoginPage, setIsLoginPage] = useState(false)
  const [demoEmail, setDemoEmail] = useState('')
  const [demoPassword, setDemoPassword] = useState('')

  useEffect(() => {
    fetch('/api/demo-status')
      .then((res) => res.json())
      .then((data) => {
        setIsDemoMode(data.isDemoMode)
        setDemoEmail(data.demoEmail || '')
        setDemoPassword(data.demoPassword || '')
      })
      .catch(() => {
        setIsDemoMode(false)
      })

    const checkLoginPage = () => {
      setIsLoginPage(window.location.pathname === '/admin/login')
    }
    
    checkLoginPage()
    
    const handleRouteChange = () => {
      setTimeout(checkLoginPage, 100)
    }
    
    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('pushstate', handleRouteChange)
    window.addEventListener('replacestate', handleRouteChange)
    
    const observer = new MutationObserver(checkLoginPage)
    observer.observe(document.body, { childList: true, subtree: true })
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('pushstate', handleRouteChange)
      window.removeEventListener('replacestate', handleRouteChange)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (isDemoMode && isLoginPage && demoEmail && demoPassword) {
      const prefillFields = () => {
        const emailInput = document.querySelector('#field-email') as HTMLInputElement
        const passwordInput = document.querySelector('#field-password') as HTMLInputElement
        
        if (emailInput && passwordInput) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set
          
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(emailInput, demoEmail)
            emailInput.dispatchEvent(new Event('input', { bubbles: true }))
            emailInput.dispatchEvent(new Event('change', { bubbles: true }))
            
            nativeInputValueSetter.call(passwordInput, demoPassword)
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
            passwordInput.dispatchEvent(new Event('change', { bubbles: true }))
          }
        } else {
          setTimeout(prefillFields, 100)
        }
      }
      
      setTimeout(prefillFields, 500)
    }
  }, [isDemoMode, isLoginPage, demoEmail, demoPassword])

  if (!isDemoMode || !isLoginPage || !demoEmail || !demoPassword) {
    return null
  }

  return (
    <div className="demo-login-notice">
      <div className="demo-login-notice__content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="demo-login-notice__icon"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="demo-login-notice__text">
          <strong>Demo Mode:</strong> Use {demoEmail} / {demoPassword} or just click "Login" to try it out!
        </div>
      </div>
    </div>
  )
}
