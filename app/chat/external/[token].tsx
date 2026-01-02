import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { Send, AlertCircle } from 'lucide-react-native';

export default function ExternalChatScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [message, setMessage] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const [guestUserId, setGuestUserId] = useState<string>('');

  const { data, isLoading, error, refetch } = trpc.chat.getMessages.useQuery({
    chatId: '',
    guestToken: token,
  });

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      console.log('[EXTERNAL CHAT] Message sent successfully');
      setMessage('');
      refetch();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (error) => {
      console.error('[EXTERNAL CHAT] Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    },
  });

  useEffect(() => {
    if (data?.chat) {
      const participantId = data.chat.participant?.id;
      if (participantId) {
        setGuestUserId(participantId);
      }
    }
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleSend = () => {
    if (!message.trim() || !guestUserId || !data?.chat?.id) return;

    console.log('[EXTERNAL CHAT] Sending message as guest');
    sendMessageMutation.mutate({
      chatId: data.chat.id,
      content: message.trim(),
      senderId: guestUserId,
      guestToken: token,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>Chargement de la conversation...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={64} color={colors.action.danger} />
        <Text style={styles.errorTitle}>Lien invalide</Text>
        <Text style={styles.errorText}>
          Ce lien de conversation n&apos;est plus valide ou a expiré.
        </Text>
      </View>
    );
  }

  const otherUser = data.chat.creator;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: `Chat avec ${otherUser?.name || 'Utilisateur'}`,
          headerStyle: {
            backgroundColor: colors.bg.card,
          },
          headerTintColor: colors.text.main,
        }}
      />

      <View style={styles.guestBanner}>
        <AlertCircle size={16} color={colors.action.warning} />
        <Text style={styles.guestBannerText}>
          Vous participez en tant qu&apos;invité
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={data?.messages || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isMine = item.senderId === guestUserId;
          return (
            <View
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.senderName}>
                {isMine ? 'Vous' : item.sender.name}
              </Text>
              <Text style={styles.messageText}>{item.content}</Text>
              <Text style={styles.messageTime}>
                {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez un message..."
          placeholderTextColor={colors.text.muted}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || !guestUserId) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || !guestUserId || sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.text.main} />
          ) : (
            <Send size={20} color={colors.text.main} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.main,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg.main,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg.main,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.main,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  guestBanner: {
    backgroundColor: colors.action.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  guestBannerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.bg.main,
  },
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand.primary,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg.card,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.muted,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: colors.text.main,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: colors.text.muted,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.bg.card,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg.main,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text.main,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
