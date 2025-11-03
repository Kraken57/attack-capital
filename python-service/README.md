# Hugging Face AMD Python Service

FastAPI service for answering machine detection using the `jakeBland/wav2vec-vm-finetune` model.

## Setup

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

The service will be available at `http://localhost:8000`

### Docker

```bash
# Build image
docker build -t amd-python-service .

# Run container
docker run -p 8000:8000 amd-python-service
```

## API Endpoints

### GET /
Health check endpoint

**Response:**
```json
{
  "status": "running",
  "model_loaded": true,
  "device": "cpu"
}
```

### POST /predict
Predict if audio is human or voicemail

**Request:**
- Content-Type: `multipart/form-data`
- Body: `audio` file (WAV format)

**Response:**
```json
{
  "label": "human",
  "confidence": 0.92,
  "processing_time": 0.45,
  "simulated": false
}
```

## Model Details

- **Model**: `jakeBland/wav2vec-vm-finetune`
- **Architecture**: Wav2Vec2 for sequence classification
- **Input**: 16kHz mono audio
- **Output**: Binary classification (human vs voicemail)
- **Accuracy**: ~92% on test data

## Integration with Next.js

The Next.js app sends audio chunks to this service via the custom WebSocket server:

```typescript
// In server.cjs
const response = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  body: formData
});
const result = await response.json();
```

## Notes

- Model downloads automatically on first run (~400MB)
- GPU support available if CUDA is installed
- Falls back to simulated results if model fails to load
