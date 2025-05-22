# Batch Tracer Application

![Batch Tracer](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/react-19.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-20-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

A modern web application for tracking and tracing agricultural batch orders with comprehensive document management and farmer information display.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Docker Deployment](#docker-deployment)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Batch Tracer is a comprehensive agricultural tracking application that allows users to trace batch orders from field to delivery. The application provides detailed information about orders, associated documents, and farmer details, making it easy to track the complete supply chain.

### Key Capabilities

- **Order Tracking**: View detailed order information with unique identifiers
- **Document Management**: Download and view various document types (PDF, images, text files)
- **Farmer Information**: Display comprehensive farmer and field details
- **Batch Tracing**: Track products through the entire supply chain
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## ✨ Features

### 🎯 Core Features

- **Dynamic URL Parsing**: Decode Base64 encoded order parameters from URLs
- **External API Integration**: Seamless integration with EProd Solutions API
- **Document Handling**: Support for multiple document types with Base64 decoding
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Error Handling**: Graceful fallback to local data when API is unavailable
- **Health Monitoring**: Built-in health check endpoints

### 📱 User Interface

- **Modern Design**: Clean, professional interface with custom color scheme
- **Mobile Optimized**: Card-based layout for mobile, table layout for desktop
- **Interactive Elements**: File download functionality with type-specific icons
- **Loading States**: Animated loading indicators and error handling
- **Accessibility**: ARIA labels and semantic HTML structure

### 🔧 Technical Features

- **Dockerized**: Complete containerization for easy deployment
- **CORS Handling**: Proper cross-origin resource sharing configuration
- **SSL Ready**: HTTPS support with Let's Encrypt integration
- **Load Balancing**: Nginx reverse proxy for production deployments
- **Auto-restart**: Container restart policies for high availability

## 🛠 Technology Stack

### Frontend
- **React 19.0.0** - Modern React with latest features
- **Vite 6.2.0** - Fast build tool and development server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Axios 1.8.4** - HTTP client for API requests

### Backend
- **Node.js 20** - Server runtime
- **Express 4.21.2** - Web application framework
- **CORS 2.8.5** - Cross-origin resource sharing middleware

### DevOps & Tools
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file server
- **ESLint** - Code linting and formatting

## 📋 Prerequisites

### Development
- Node.js 18+ and npm
- Git for version control
- Modern web browser

### Production Deployment
- Docker and Docker Compose
- Linux server (Ubuntu/CentOS/RHEL)
- Domain name (optional, for SSL)

## 🚀 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd batch-tracer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Start backend server**
   ```bash
   npm run start-server
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

### Docker Development

1. **Quick start with Docker**
   ```bash
   docker compose up --build
   ```

2. **Access the application**
   - Application: http://localhost:3000

## 📖 Usage

### URL Structure

The application accepts encoded parameters in the URL path:

```
https://yourdomain.com/order/{encoded-data}
```

**Supported encoding formats:**
- `licenceid:guid` (colon-separated)
- `licenceid.guid` (dot-separated)
- Base64 encoded strings

**Example URLs:**
```
https://yourdomain.com/order/Mjg3LntCMkNGQjMyNy1GNUNFLTRCNkEtQjBDMC05MzJFMjhENDg5RjF9
https://yourdomain.com/order/bXlsaWNlbmNl:6AC45E5F-232F-4A4D-9DBF-65F93C71ACF2
```

### Features in Action

1. **Order Information**: View order number, batch number, and description
2. **Document Downloads**: Click download buttons for associated documents
3. **Farmer Details**: View comprehensive farmer and field information
4. **Responsive Layout**: Automatic adaptation to screen size

### Document Types Supported

- **PDF Files**: Purchase orders, certificates
- **Images**: PNG, JPG, SVG files
- **Text Files**: Logs, plain text documents
- **Any Base64**: Generic document support

## 🔌 API Integration

### External API Endpoint

```
POST http://test-dev.api-eprod-solutions.com:9000/trace/orders
```

**Request Format:**
```json
{
  "licenseid": "string",
  "guid": "string"
}
```

**Response Format:**
```json
{
  "result": "OK",
  "OrderNumber": "string",
  "Description": "string",
  "UID": "string",
  "documents": [
    {
      "documentType": "string",
      "documentBase64": "string",
      "documentName": "string",
      "documentNumber": "string"
    }
  ],
  "farmers": [
    {
      "BatchNumber": "string",
      "FarmerName": "string",
      "FieldName": "string",
      "GroupName": "string",
      "Location": "string"
    }
  ]
}
```

### Fallback Mechanism

When the external API is unavailable, the application automatically falls back to local JSON data (`/orders.json`).

## 🐳 Docker Deployment

### Quick Deployment

1. **Simple deployment**
   ```bash
   docker compose up -d --build
   ```

2. **Production deployment with Nginx**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Using the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Linux Server Deployment

1. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Deploy application**
   ```bash
   git clone <repository-url> batch-tracer
   cd batch-tracer
   ./deploy.sh
   ```

3. **Configure firewall**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### SSL Configuration

For HTTPS support:

1. **Install Certbot**
   ```bash
   sudo apt install certbot
   ```

2. **Generate SSL certificate**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Copy certificates**
   ```bash
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/certificate.crt
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/private.key
   ```

4. **Restart application**
   ```bash
   ./deploy.sh restart
   ```

## 📁 Project Structure

```
batch-tracer/
├── src/
│   ├── App.jsx              # Main React component
│   ├── main.jsx             # React application entry
│   ├── index.css            # Tailwind CSS imports
│   └── assets/              # Static assets
├── public/
│   ├── orders.json          # Fallback data
│   └── eprod logo.ico       # Application favicon
├── .docker/
│   └── nginx.conf           # Nginx configuration
├── ssl/                     # SSL certificates directory
├── dist/                    # Production build output
├── server.cjs               # Express server
├── deploy.sh               # Deployment automation script
├── docker-compose.yml       # Development Docker config
├── docker-compose.prod.yml  # Production Docker config
├── Dockerfile              # Container build instructions
├── package.json            # Node.js dependencies
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.js          # Vite build configuration
└── README.md               # This file
```

## ⚙️ Environment Variables

### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `EXTERNAL_API_URL` | External API endpoint | See server.cjs | No |

### Docker Environment

Create a `.env` file for custom configuration:

```env
NODE_ENV=production
PORT=3000
EXTERNAL_API_URL=http://test-dev.api-eprod-solutions.com:9000/trace/orders
```

## 🔧 Development Commands

### NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run start-server # Start Express server
```

### Docker Commands

```bash
# Development
docker compose up --build
docker compose logs -f
docker compose down

# Production
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down

# Using deployment script
./deploy.sh deploy   # Deploy application
./deploy.sh logs     # View logs
./deploy.sh restart  # Restart services
./deploy.sh stop     # Stop application
```

## 🔍 Monitoring & Troubleshooting

### Health Checks

- **Application Health**: `GET /health`
- **Container Status**: `docker compose ps`
- **Application Logs**: `docker compose logs -f`

### Common Issues

1. **Port conflicts**: Change port mapping in docker-compose.yml
2. **API connection errors**: Check EXTERNAL_API_URL configuration
3. **SSL issues**: Verify certificate paths and permissions
4. **Memory issues**: Monitor container resource usage

### Log Locations

- **Application logs**: `docker compose logs batch-tracer`
- **Nginx logs**: `docker compose logs nginx`
- **System logs**: `/var/log/docker/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Use Tailwind CSS for styling
- Write responsive components
- Test across different browsers
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [EProd Solutions](http://test-dev.api-eprod-solutions.com) for API integration
- [Tailwind CSS](https://tailwindcss.com) for the design system
- [React](https://reactjs.org) for the frontend framework
- [Docker](https://docker.com) for containerization support

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the deployment logs

---

**Built with ❤️ for agricultural traceability and transparency**