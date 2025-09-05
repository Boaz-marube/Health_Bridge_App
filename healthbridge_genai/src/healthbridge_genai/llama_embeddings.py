# src/healthbridge/llama_embeddings.py
from langchain.embeddings.base import Embeddings
from transformers import AutoTokenizer, AutoModel
import torch

class Llama3Embeddings(Embeddings):
    def __init__(self, model_name="meta-llama/Llama-3-7b-hf"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

    def embed_documents(self, texts):
        return [self._embed(text) for text in texts]

    def embed_query(self, text):
        return self._embed(text)

    def _embed(self, text):
        # Tokenize
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(self.device)
        # Forward pass
        with torch.no_grad():
            outputs = self.model(**inputs, output_hidden_states=True)
        # Use the mean of last hidden state as embedding
        embeddings = outputs.hidden_states[-1].mean(dim=1)
        return embeddings.cpu().numpy()[0]
