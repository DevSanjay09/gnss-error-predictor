# #new version
# # train.py
# # train.py
# import os
# import joblib
# import numpy as np
# import sys
# import importlib
# import utils.transformer_model
# importlib.reload(utils.transformer_model)
# from utils.transformer_model import build_transformer_model

# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
# from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
# from utils.preprocess import preprocess
# from utils.transformer_model import build_transformer_model

# # Create models folder
# os.makedirs("models", exist_ok=True)

# # Load and preprocess data
# file_paths = ["data/DATA_GEO_Train.csv","data/DATA_MEO_Train.csv","data/DATA_MEO_Train2.csv"]
# features = ['x_error', 'y_error', 'z_error', 'satclockerror']
# scaled_data, scaler, _ = preprocess(file_paths, features=features)
# joblib.dump(scaler, "models/scaler.pkl")
# print("✅ Scaler saved as models/scaler.pkl")

# # Create sequences
# TIME_STEPS = 20
# def create_sequences(data, time_steps=TIME_STEPS):
#     X, y = [], []
#     for i in range(len(data)-time_steps):
#         X.append(data[i:i+time_steps])
#         y.append(data[i+time_steps])
#     return np.array(X), np.array(y)

# X, y = create_sequences(scaled_data)
# split = int(len(X)*0.8)
# X_train, X_test = X[:split], X[split:]
# y_train, y_test = y[:split], y[split:]

# # === LSTM Model ===
# lstm_model = Sequential([
#     Input(shape=(TIME_STEPS, X_train.shape[2])),
#     LSTM(128, return_sequences=True),
#     Dropout(0.2),
#     LSTM(64),
#     Dropout(0.2),
#     Dense(32, activation='relu'),
#     Dense(y_train.shape[1])
# ])
# lstm_model.compile(optimizer='adam', loss='mse')

# es = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
# mc = ModelCheckpoint("models/lstm_model.h5", save_best_only=True)

# print("🚀 Training LSTM model...")
# lstm_model.fit(
#     X_train, y_train,
#     validation_split=0.2,
#     epochs=100,
#     batch_size=32,
#     callbacks=[es, mc],
#     verbose=1
# )
# print("✅ LSTM model saved as models/lstm_model.h5")

# # === Transformer Model ===
# input_shape = (TIME_STEPS, X_train.shape[2])
# output_dim = y_train.shape[1]

# transformer_model = build_transformer_model(input_shape, output_dim)
# print("🚀 Training Transformer model...")
# transformer_model.fit(
#     X_train, y_train,
#     validation_split=0.2,
#     epochs=50,
#     batch_size=32,
#     verbose=1
# )
# transformer_model.save("models/transformer_model.h5")
# print("✅ Transformer model saved as models/transformer_model.h5")

# print("🎉 All models trained and saved successfully!")






import os
import joblib
import numpy as np
import random
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from utils.preprocess import preprocess, create_sequences
from utils.transformer_model import build_transformer_model

# ========================================
# Reproducibility
# ========================================
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)
random.seed(SEED)
os.environ['PYTHONHASHSEED'] = str(SEED)

# ========================================
# Setup paths
# ========================================
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

file_paths = [
    "data/DATA_GEO_Train.csv",
    "data/DATA_MEO_Train.csv",
    "data/DATA_MEO_Train2.csv"
]
features = ['x_error', 'y_error', 'z_error', 'satclockerror']

# ========================================
# Load & preprocess
# ========================================
print("📊 Loading & preprocessing data...")
scaled_data, scaler, _ = preprocess(file_paths, features=features, scaler_path=os.path.join(MODELS_DIR, "scaler.pkl"))
joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))

TIME_STEPS = 20
X, y = create_sequences(scaled_data, time_steps=TIME_STEPS)

if X.size == 0 or y.size == 0:
    raise RuntimeError("❌ Not enough data to create valid sequences. Add more rows or reduce TIME_STEPS.")

# ========================================
# Safe indexing fix
# ========================================
min_len = min(len(X), len(y))
X, y = X[:min_len], y[:min_len]

idx = np.arange(min_len)
np.random.shuffle(idx)
X, y = X[idx], y[idx]

split_idx = int(0.8 * len(X))
X_train, X_val = X[:split_idx], X[split_idx:]
y_train, y_val = y[:split_idx], y[split_idx:]

print(f"✅ Shapes - X_train: {X_train.shape}, y_train: {y_train.shape}, X_val: {X_val.shape}")

# ========================================
# Optimized LSTM model
# ========================================
lstm = Sequential([
    Input(shape=(TIME_STEPS, X_train.shape[2])),
    LSTM(128, return_sequences=True),
    BatchNormalization(),
    Dropout(0.3),
    LSTM(64),
    BatchNormalization(),
    Dropout(0.25),
    Dense(128, activation="relu"),
    Dropout(0.2),
    Dense(y_train.shape[1], activation="linear", name="output")
])

lstm.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
              loss="mse", metrics=["mae"])

es = EarlyStopping(monitor="val_loss", patience=15, restore_best_weights=True, verbose=1)
mc = ModelCheckpoint(os.path.join(MODELS_DIR, "lstm_model.keras"), monitor="val_loss", save_best_only=True, verbose=1)
rlr = ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=7, min_lr=1e-6, verbose=1)

print("🚀 Training LSTM...")
history_lstm = lstm.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=120,
    batch_size=64,
    callbacks=[es, mc, rlr],
    verbose=2
)

print("✅ LSTM model saved as lstm_model.keras")

# ========================================
# Optimized Transformer model
# ========================================
input_shape = (TIME_STEPS, X_train.shape[2])
transformer = build_transformer_model(
    input_shape=input_shape,
    output_dim=y_train.shape[1],
    head_dim=16,
    num_heads=4,
    ff_dim=256,
    dropout=0.2
)

transformer.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=8e-4),
    loss="mse",
    metrics=["mae"]
)

mc_t = ModelCheckpoint(os.path.join(MODELS_DIR, "transformer_model.keras"), monitor="val_loss", save_best_only=True, verbose=1)
es_t = EarlyStopping(monitor="val_loss", patience=15, restore_best_weights=True, verbose=1)
rlr_t = ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=7, min_lr=1e-6, verbose=1)

print("⚡ Training Transformer...")
history_trans = transformer.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=100,
    batch_size=64,
    callbacks=[es_t, mc_t, rlr_t],
    verbose=2
)

print("✅ Transformer model saved as transformer_model.keras")

# ========================================
# Summary of performance
# ========================================
val_loss_lstm = min(history_lstm.history['val_loss'])
val_loss_trans = min(history_trans.history['val_loss'])
print(f"\n📈 Best Validation Loss → LSTM: {val_loss_lstm:.5f} | Transformer: {val_loss_trans:.5f}")

if val_loss_trans < val_loss_lstm:
    print("🏆 Transformer performed better overall!")
else:
    print("🏆 LSTM performed better overall!")

print("\n✅ Training complete. Models stored in /models/")

