<script setup lang="ts">
const colorMode = useColorMode()
const config = useRuntimeConfig()
const siteConfig = config.public.siteConfig as {
  author?: string
  twitter?: string
  github?: string
  linkedin?: string
  youtube?: string
  mastodon?: string
  newsletter?: string
}

const currentYear = new Date().getFullYear()
const isDark = computed(() => colorMode.value === 'dark')

function toggleDarkMode(e: Event) {
  e.preventDefault()
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const socialLinks = computed(() => {
  const links: Array<{ name: string; url: string; icon: string; title: string }> = []

  if (siteConfig.twitter) {
    links.push({
      name: 'twitter',
      url: `https://twitter.com/${siteConfig.twitter}`,
      icon: 'mdi:twitter',
      title: `Twitter @${siteConfig.twitter}`,
    })
  }

  if (siteConfig.mastodon) {
    links.push({
      name: 'mastodon',
      url: siteConfig.mastodon,
      icon: 'mdi:mastodon',
      title: 'Mastodon',
    })
  }

  if (siteConfig.github) {
    links.push({
      name: 'github',
      url: `https://github.com/${siteConfig.github}`,
      icon: 'mdi:github',
      title: `GitHub @${siteConfig.github}`,
    })
  }

  if (siteConfig.linkedin) {
    links.push({
      name: 'linkedin',
      url: `https://www.linkedin.com/in/${siteConfig.linkedin}`,
      icon: 'mdi:linkedin',
      title: `LinkedIn ${siteConfig.author}`,
    })
  }

  if (siteConfig.youtube) {
    links.push({
      name: 'youtube',
      url: `https://www.youtube.com/${siteConfig.youtube}`,
      icon: 'mdi:youtube',
      title: `YouTube ${siteConfig.author}`,
    })
  }

  if (siteConfig.newsletter) {
    links.push({
      name: 'newsletter',
      url: siteConfig.newsletter,
      icon: 'mdi:email-outline',
      title: 'Newsletter',
    })
  }

  return links
})
</script>

<template>
  <footer class="notion-footer">
    <div class="notion-footer-copyright">
      Copyright {{ currentYear }} {{ siteConfig.author }}
    </div>

    <div class="notion-footer-settings">
      <ClientOnly>
        <a
          href="#"
          role="button"
          class="notion-footer-toggle-dark-mode"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDarkMode"
        >
          <Icon v-if="isDark" icon="ph:moon-fill" />
          <Icon v-else icon="ph:sun-bold" />
        </a>
      </ClientOnly>
    </div>

    <div class="notion-footer-social">
      <a
        v-for="link in socialLinks"
        :key="link.name"
        :href="link.url"
        :title="link.title"
        :class="`notion-footer-social-${link.name}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon :icon="link.icon" />
      </a>
    </div>
  </footer>
</template>

<style scoped>
.notion-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--fg-color-1);
  font-size: 0.875rem;
  color: var(--fg-color-3);
  gap: 1rem;
}

.notion-footer-copyright {
  flex: 1;
}

.notion-footer-settings {
  display: flex;
  align-items: center;
}

.notion-footer-toggle-dark-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  color: var(--fg-color-3);
  transition: background 0.1s ease-out;
}

.notion-footer-toggle-dark-mode:hover {
  background: var(--bg-color-0);
  color: var(--fg-color);
}

.notion-footer-toggle-dark-mode svg {
  width: 1.25rem;
  height: 1.25rem;
}

.notion-footer-social {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notion-footer-social a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  color: var(--fg-color-3);
  transition: background 0.1s ease-out, color 0.1s ease-out;
}

.notion-footer-social a:hover {
  background: var(--bg-color-0);
  color: var(--fg-color);
}

.notion-footer-social a svg {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 640px) {
  .notion-footer {
    flex-direction: column;
    text-align: center;
  }

  .notion-footer-copyright {
    order: 2;
    flex: none;
    width: 100%;
  }

  .notion-footer-settings {
    order: 0;
  }

  .notion-footer-social {
    order: 1;
  }
}
</style>
