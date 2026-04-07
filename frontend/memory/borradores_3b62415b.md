# Borradores 3B62415B

**Generado por:** Scribe
**Fecha:** 2026-04-07 03:52:32 UTC

---

## Proyecto: Crear Landing Page en React - CarpinMatch (Tinder de Carpinchos)

{"name": "file_writer", "arguments": {"file_path": "/app/projects/crear-landing-page-en-react---carpinmatch--tinder-de-carpinchos/src/__tests__/LandingPage.test.jsx", "content": "// LandingPage.test.jsx\nimport React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport LandingPage from '../pages/LandingPage.jsx';\n\ndescribe('LandingPage Component', () => {\n  test('renders learn react link', () => {\n    render(<LandingPage />);\n    const linkElement = screen.getByText(/learn react/i);\n    expect(linkElement).toBeInTheDocument();\n  });\n});"}}