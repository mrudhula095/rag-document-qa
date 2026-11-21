import os
from fastembed import TextEmbedding

_CACHE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models_cache"
)
_model = None


def _get_model():
    global _model
    if _model is None:
        _model = TextEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            cache_dir=_CACHE,
        )
    return _model


def embed_documents(texts):
    return [v.tolist() for v in _get_model().embed(list(texts))]


def embed_text(text):
    return next(iter(_get_model().embed([text]))).tolist()