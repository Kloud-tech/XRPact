# Guide de Migration vers Architecture Senior

## 🎯 Objectif

Transformer le code actuel en architecture hexagonale production-ready sans tout réécrire.

---

## 📋 État Actuel vs Cible

### Ce qui existe déjà ✅
- ✅ XRPL Module (services, controllers, routes)
- ✅ AI Trading Algorithm
- ✅ Impact Oracle Service
- ✅ Mock Data Generator
- ✅ Frontend components (NGOList, PoolBalance, etc.)
- ✅ Zustand store
- ✅ Docker compose

### Ce qu'il faut ajouter 🔨
- 🔨 Emergency Module
- 🔨 Donation Stories + QR
- 🔨 WebSocket real-time
- 🔨 Governance voting
- 🔨 DIT (Donor Impact Tokens)
- 🔨 Better error handling
- 🔨 API versioning

---

## 🚀 Plan de Migration (4 étapes)

### Étape 1: Réorganisation Backend (2-3h)

#### 1.1 Créer structure core/
```bash
mkdir -p backend/src/core/domain
mkdir -p backend/src/core/usecases
mkdir -p backend/src/core/ports
```

#### 1.2 Migrer les types existants vers domain entities
```typescript
// backend/src/core/domain/donor.entity.ts
export class Donor {
  constructor(
    public address: string,
    public totalDonated: number,
    public xp: number,
    public level: number,
    public nftTokenId?: string,
    public ditTokenId?: string,
    public firstDonationDate?: Date,
    public lastDonationDate?: Date,
    public donationCount: number = 0
  ) {}

  // Business logic ici
  addDonation(amount: number): void {
    this.totalDonated += amount;
    this.xp += amount * 10;
    this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
    this.donationCount++;
    this.lastDonationDate = new Date();
  }

  shouldEvolveNFT(previousLevel: number): boolean {
    return this.level > previousLevel && this.level % 5 === 0;
  }
}
```

#### 1.3 Extraire business logic vers UseCases
```typescript
// backend/src/core/usecases/process-donation.usecase.ts
export class ProcessDonationUseCase {
  constructor(
    private xrplGateway: IXRPLGateway,
    private donorRepository: IDonorRepository,
    private nftMinter: INFTMinter
  ) {}

  async execute(command: DonateCommand): Promise<DonationResult> {
    // 1. Validate
    this.validate(command);

    // 2. Process XRPL payment
    const txResult = await this.xrplGateway.sendPayment({
      from: command.donorAddress,
      to: config.poolWallet,
      amount: command.amount
    });

    // 3. Update donor
    let donor = await this.donorRepository.findByAddress(command.donorAddress);
    const previousLevel = donor?.level || 0;

    if (!donor) {
      donor = new Donor(command.donorAddress, 0, 0, 0);
    }

    donor.addDonation(command.amount);
    await this.donorRepository.save(donor);

    // 4. Mint NFT if level up
    let nftResult;
    if (donor.shouldEvolveNFT(previousLevel)) {
      nftResult = await this.nftMinter.mint({
        ownerAddress: donor.address,
        level: donor.level,
        xp: donor.xp
      });
      donor.nftTokenId = nftResult.tokenId;
      await this.donorRepository.save(donor);
    }

    return {
      donor,
      transaction: txResult,
      nft: nftResult
    };
  }

  private validate(command: DonateCommand): void {
    if (command.amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    if (!command.donorAddress.match(/^r[a-zA-Z0-9]{24,34}$/)) {
      throw new ValidationError('Invalid XRPL address');
    }
  }
}
```

#### 1.4 Créer Ports (interfaces)
```typescript
// backend/src/core/ports/xrpl-gateway.port.ts
export interface IXRPLGateway {
  sendPayment(params: PaymentParams): Promise<TransactionResult>;
  getBalance(address: string): Promise<number>;
  mintNFT(params: NFTParams): Promise<NFTMintResult>;
}

// backend/src/core/ports/donor-repository.port.ts
export interface IDonorRepository {
  findByAddress(address: string): Promise<Donor | null>;
  save(donor: Donor): Promise<void>;
  findTopDonors(limit: number): Promise<Donor[]>;
}
```

#### 1.5 Adapter le controller
```typescript
// backend/src/api/controllers/donation.controller.ts
export class DonationController {
  constructor(
    private processDonationUseCase: ProcessDonationUseCase
  ) {}

  async donate(req: Request, res: Response, next: NextFunction) {
    try {
      const command: DonateCommand = {
        donorAddress: req.body.donorAddress,
        amount: req.body.amount,
        signature: req.body.signature
      };

      const result = await this.processDonationUseCase.execute(command);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
```

---

### Étape 2: Ajouter Emergency Module (1-2h)

#### 2.1 Créer Emergency Domain
```typescript
// backend/src/core/domain/emergency-fund.entity.ts
export class EmergencyFund {
  constructor(
    public id: string,
    public triggeredBy: string,
    public severity: 'low' | 'medium' | 'high' | 'critical',
    public reason: string,
    public amountReleased: number,
    public affectedNGOs: string[],
    public status: 'pending' | 'approved' | 'distributed' | 'rejected',
    public votesFor: number = 0,
    public votesAgainst: number = 0,
    public createdAt: Date = new Date()
  ) {}

  hasQuorum(totalVotingPower: number): boolean {
    const totalVotes = this.votesFor + this.votesAgainst;
    return totalVotes >= totalVotingPower * 0.2; // 20% quorum
  }

  isApproved(): boolean {
    return this.votesFor > this.votesAgainst;
  }

  canDistribute(): boolean {
    return this.status === 'approved' && this.hasQuorum(1000);
  }
}
```

#### 2.2 Créer Emergency UseCase
```typescript
// backend/src/core/usecases/trigger-emergency.usecase.ts
export class TriggerEmergencyUseCase {
  async execute(command: TriggerEmergencyCommand): Promise<EmergencyFund> {
    // Validation
    this.validateSeverity(command.severity);

    // Create emergency fund
    const emergency = new EmergencyFund(
      generateId(),
      command.triggeredBy,
      command.severity,
      command.reason,
      command.amountRequested,
      command.affectedNGOs,
      'pending'
    );

    // Save
    await this.emergencyRepository.save(emergency);

    // Notify (WebSocket)
    await this.notificationService.broadcast({
      type: 'EMERGENCY_TRIGGERED',
      data: emergency
    });

    return emergency;
  }
}
```

#### 2.3 Créer Emergency Routes
```typescript
// backend/src/api/routes/emergency.routes.ts
import { Router } from 'express';

const router = Router();

router.get('/status', emergencyController.getStatus);
router.post('/trigger', emergencyController.trigger);
router.post('/:id/vote', emergencyController.vote);
router.post('/:id/distribute', emergencyController.distribute);

export default router;
```

---

### Étape 3: Ajouter Donation Stories + QR (1-2h)

#### 3.1 Créer Story Domain
```typescript
// backend/src/core/domain/donation-story.entity.ts
export class DonationStory {
  constructor(
    public id: string,
    public donationId: string,
    public ngoId: string,
    public ngoName: string,
    public title: string,
    public description: string,
    public impactDescription: string,
    public images: string[],
    public qrCode: string,
    public shareUrl: string,
    public createdAt: Date = new Date()
  ) {}

  generateQRCode(): string {
    return `https://xrpl-impact.fund/stories/${this.id}`;
  }

  generateShareText(): string {
    return `J'ai donné ${this.impactDescription} via XRPL Impact Fund! 🌍 ${this.shareUrl}`;
  }
}
```

#### 3.2 Créer QR Service
```typescript
// backend/src/infrastructure/qr/qr-generator.service.ts
import QRCode from 'qrcode';

export class QRGeneratorService {
  async generate(url: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 512,
        margin: 2,
        color: {
          dark: '#1E40AF',  // Blue
          light: '#FFFFFF'
        }
      });

      return qrDataUrl;
    } catch (error) {
      throw new QRGenerationError('Failed to generate QR code');
    }
  }

  async generateWithLogo(url: string, logoPath: string): Promise<string> {
    // Add XRPL logo in center
    // Implementation with canvas
  }
}
```

#### 3.3 Frontend QR Component
```typescript
// frontend/src/features/stories/components/QRCodeGenerator.tsx
import { QRCodeSVG } from 'qrcode.react';

export const QRCodeGenerator: React.FC<{ storyId: string }> = ({ storyId }) => {
  const shareUrl = `https://xrpl-impact.fund/stories/${storyId}`;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg!);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `impact-story-${storyId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG
        id="qr-code"
        value={shareUrl}
        size={256}
        level="H"
        includeMargin
      />
      <button onClick={downloadQR} className="btn-primary">
        Download QR Code
      </button>
    </div>
  );
};
```

---

### Étape 4: Real-Time avec WebSocket (1h)

#### 4.1 Backend WebSocket Setup
```typescript
// backend/src/infrastructure/websocket/socket.service.ts
import { Server } from 'socket.io';

export class SocketService {
  private io: Server;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('subscribe:pool', () => {
        socket.join('pool-updates');
      });

      socket.on('subscribe:donations', () => {
        socket.join('donation-feed');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  broadcastToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }
}

// Integrate in index.ts
const server = app.listen(PORT);
const socketService = new SocketService(server);

// Use in controllers
donationController.on('donation-created', (donation) => {
  socketService.broadcastToRoom('donation-feed', 'new-donation', donation);
  socketService.broadcastToRoom('pool-updates', 'pool-updated', newPoolState);
});
```

#### 4.2 Frontend WebSocket Hook
```typescript
// frontend/src/shared/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(url);

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const unsubscribe = (event: string) => {
    if (socket) {
      socket.off(event);
    }
  };

  return { socket, connected, subscribe, unsubscribe };
};
```

#### 4.3 Use in Components
```typescript
// frontend/src/features/dashboard/components/PoolStats.tsx
export const PoolStats: React.FC = () => {
  const { socket, connected } = useWebSocket('http://localhost:3000');
  const [poolState, setPoolState] = useState<PoolState | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('subscribe:pool');

    socket.on('pool-updated', (data: PoolState) => {
      setPoolState(data);
    });

    socket.on('new-donation', (donation) => {
      // Animate new donation
      showNotification(`New donation: ${donation.amount} XRP!`);
    });

    return () => {
      socket.off('pool-updated');
      socket.off('new-donation');
    };
  }, [socket]);

  return (
    <div>
      {connected && <Badge color="green">Live</Badge>}
      {poolState && (
        <div className="stats">
          <Stat label="Pool Balance" value={poolState.totalBalance} />
          <Stat label="Donors" value={poolState.donorCount} />
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 Fichiers à Créer/Modifier

### Nouveaux fichiers Backend
```bash
# Core
backend/src/core/domain/donor.entity.ts
backend/src/core/domain/ngo.entity.ts
backend/src/core/domain/donation.entity.ts
backend/src/core/domain/emergency-fund.entity.ts
backend/src/core/domain/donation-story.entity.ts

backend/src/core/usecases/process-donation.usecase.ts
backend/src/core/usecases/distribute-profits.usecase.ts
backend/src/core/usecases/trigger-emergency.usecase.ts
backend/src/core/usecases/create-story.usecase.ts

backend/src/core/ports/xrpl-gateway.port.ts
backend/src/core/ports/donor-repository.port.ts
backend/src/core/ports/ngo-repository.port.ts

# Infrastructure
backend/src/infrastructure/websocket/socket.service.ts
backend/src/infrastructure/qr/qr-generator.service.ts

# API
backend/src/api/routes/emergency.routes.ts
backend/src/api/routes/stories.routes.ts
backend/src/api/controllers/emergency.controller.ts
backend/src/api/controllers/stories.controller.ts
backend/src/api/middlewares/error-handler.middleware.ts
backend/src/api/middlewares/rate-limiter.middleware.ts
```

### Nouveaux fichiers Frontend
```bash
# Features
frontend/src/features/emergency/components/EmergencyTrigger.tsx
frontend/src/features/emergency/components/EmergencyStatus.tsx
frontend/src/features/emergency/hooks/useEmergency.ts

frontend/src/features/stories/components/QRCodeGenerator.tsx
frontend/src/features/stories/components/StoryCard.tsx
frontend/src/features/stories/hooks/useStories.ts

# Shared
frontend/src/shared/hooks/useWebSocket.ts
frontend/src/shared/components/Badge.tsx
frontend/src/shared/components/Notification.tsx
```

---

## ✅ Checklist Migration

### Backend
- [ ] Créer structure core/ (domain, usecases, ports)
- [ ] Migrer types vers entities
- [ ] Extraire logic vers usecases
- [ ] Créer ports/interfaces
- [ ] Adapter controllers
- [ ] Ajouter Emergency module
- [ ] Ajouter Stories module
- [ ] Setup WebSocket
- [ ] Ajouter error middleware
- [ ] Ajouter rate limiting

### Frontend
- [ ] Créer Emergency feature
- [ ] Créer Stories feature
- [ ] Ajouter QR components
- [ ] Setup WebSocket hook
- [ ] Add real-time updates
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Mobile responsive fixes

### DevOps
- [ ] Update docker-compose
- [ ] Add Redis for sessions
- [ ] Configure WebSocket in nginx
- [ ] Add monitoring
- [ ] Setup CI/CD

---

## 🚀 Quick Wins (2h max)

Si temps limité, prioriser :

1. **Emergency Module** (30min)
   - Controller + routes basiques
   - Frontend status component
   - Mock trigger button

2. **QR Code Stories** (30min)
   - QR generator service
   - Frontend QR display
   - Share button

3. **WebSocket Real-Time** (30min)
   - Basic socket setup
   - Pool updates broadcast
   - Frontend listener

4. **Error Handling** (30min)
   - Global middleware
   - Custom errors
   - Frontend error boundary

Total : 2h pour features différenciantes hackathon ! 🏆
