# from tensorflow.keras.models import Model
# from tensorflow.keras.layers import Input, Dense, MultiHeadAttention, LayerNormalization, Dropout, Flatten

# def build_transformer_model(input_shape, output_dim):
#     """
#     Builds a Transformer-based regression model.
#     """
#     input_layer = Input(shape=input_shape)
#     attn = MultiHeadAttention(num_heads=4, key_dim=16)(input_layer, input_layer)
#     attn = Dropout(0.1)(attn)
#     attn = LayerNormalization()(attn)
#     flat = Flatten()(attn)
#     dense1 = Dense(64, activation='relu')(flat)
#     output_layer = Dense(output_dim)(dense1)

#     model = Model(inputs=input_layer, outputs=output_layer)
#     model.compile(optimizer='adam', loss='mse')
#     return model


# utils/transformer_model.py
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, MultiHeadAttention, LayerNormalization, Dropout, GlobalAveragePooling1D
from tensorflow.keras import regularizers

def build_transformer_model(input_shape, output_dim, head_dim=16, num_heads=4, ff_dim=64, dropout=0.1):
    """
    Lightweight Transformer encoder followed by pooling and Dense layers for regression.
    input_shape: (time_steps, features)
    output_dim: number of features predicted
    """
    inp = Input(shape=input_shape)
    # Self-attention
    attn = MultiHeadAttention(num_heads=num_heads, key_dim=head_dim)(inp, inp)
    attn = Dropout(dropout)(attn)
    attn = LayerNormalization(epsilon=1e-6)(attn)

    # Feed-forward on sequence axis (pointwise)
    x = Dense(ff_dim, activation="relu", kernel_regularizer=regularizers.l2(1e-5))(attn)
    x = Dropout(dropout)(x)
    x = LayerNormalization(epsilon=1e-6)(x)

    # Pool over time and output
    x = GlobalAveragePooling1D()(x)
    x = Dense(ff_dim, activation="relu")(x)
    out = Dense(output_dim, name="output")(x)

    model = Model(inputs=inp, outputs=out)
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model
