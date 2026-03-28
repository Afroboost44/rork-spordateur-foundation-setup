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
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';
import { Heart, Send, Link as LinkIcon, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import * as Clipboard from 'expo-clipboard';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  const { data, isLoading, refetch } = trpc.chat.getMessages.useQuery({
    chatId: id,
    userId: user?.id,
  }, {
    enabled: !!user?.id && !!id,
  });

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      console.log('[CHAT] Message sent successfully');
      setMessage('');
      refetch();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (error) => {
      console.error('[CHAT] Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    },
  });

  const generateLinkMutation = trpc.chat.generateExternalLink.useMutation({
    onSuccess: (data) => {
      console.log('[CHAT] External link generated');
      setGeneratedLink(data.url);
      setShowLinkModal(true);
    },
    onError: (error) => {
      console.error('[CHAT] Error generating link:', error);
      Alert.alert('Erreur', 'Impossible de générer le lien');
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleSend = () => {
    if (!message.trim()) return;

    console.log('[CHAT] Sending message');
    sendMessageMutation.mutate({
      chatId: id,
      content: message.trim(),
      senderId: user?.id || '',
    });
  };

  const handleGenerateLink = () => {
    console.log('[CHAT] Generating external link');
    generateLinkMutation.mutate({
      chatId: id,
      userId: user?.id || '',
    });
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(generatedLink);
    Alert.alert('Copié', 'Le lien a été copié dans le presse-papiers');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  const otherUser =
    data?.chat.creator.id === user?.id
      ? data?.chat.participant
      : data?.chat.creator;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: otherUser?.name || 'Chat',
          headerStyle: {
            backgroundColor: colors.bg.card,
          },
          headerTintColor: colors.text.main,
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/offers' as any)}
              >
                <Calendar size={24} color={colors.brand.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleGenerateLink}
              >
                <LinkIcon size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={data?.messages || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id;
          return (
            <View
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.theirMessage,
              ]}
            >
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
            !message.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.text.main} />
          ) : (
            <Send size={20} color={colors.text.main} />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLinkModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Heart size={48} color={colors.brand.primary} />
            <Text style={styles.modalTitle}>Inviter un ami</Text>
            <Text style={styles.modalSubtitle}>
              Partagez ce lien avec un ami pour qu&apos;il rejoigne la conversation
            </Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={1}>
                {generatedLink}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLink}
            >
              <Text style={styles.copyButtonText}>Copier le lien</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLinkModal(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  headerButton: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.bg.card,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.main,
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  linkContainer: {
    backgroundColor: colors.bg.main,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.main,
  },
  closeButton: {
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
