import Head from 'next/head';
import { GetStaticProps } from 'next/types';
import React, { useEffect } from 'react';
import NotionService, { NotionPost } from 'services/notion/notionApi';
import MoveToAnotherPost from 'components/blocks/moveToAnotherPost/MoveToAnotherPost';
import Layout from 'components/templates/layout/Layout';
import { useRouter } from 'next/router';
import PostDetailInfo from 'components/blocks/postDetail/info/PostDetailInfo';
import PostBlocks from 'components/blocks/postBlocks/PostBlock';
import FacebookComment from 'components/elements/fbComment/FacebookComment';

interface Props {
  notionList: NotionPost[];
  notionPost: NotionPost;
  blocks: any;
}
const PostDetailPage = ({ notionList, notionPost, blocks }: Props) => {
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    console.log(notionList);
    console.log(notionPost);
    console.log(blocks);
  }, []);
  if (router.isFallback) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Hooneylog - {notionPost?.title}</title>
        <meta property="og:description" content={notionPost?.title} />
        <meta name="description" content={notionPost.description} />
        <meta property="og:title" content={notionPost.title} />
        <meta property="og:description" content={notionPost.description} />
        <meta property="og:url" content={`https://www.hooneylog.com/post/${notionPost.id}`} />
        <meta property="og:type" content="website" />
      </Head>
      <Layout>
        <PostDetailInfo title={notionPost.title} createdAt={notionPost.createdAt} tags={notionPost.tags} />
        <PostBlocks blocks={blocks} />
        <MoveToAnotherPost notionList={notionList} notionPost={notionPost} />
        <FacebookComment slug={notionPost.id} />
      </Layout>
    </>
  );
};

export const getStaticPaths = async () => {
  const notionList = await new NotionService().getAllPost();

  const slugs = notionList.map(({ id }) => ({
    params: { slug: id },
  }));

  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const { slug } = params;

  if (typeof slug !== 'string') {
    return {
      notFound: true,
    };
  }

  const notionApi = new NotionService();
  const notionPost = await notionApi.getOnePostById(slug);

  if (!notionPost) {
    return {
      notFound: true,
    };
  }

  const notionList = await notionApi.getAllPost();
  const blocks = await notionApi.getBlocksById(slug);

  return {
    props: {
      notionList,
      notionPost,
      blocks,
    },
    revalidate: 1,
  };
};

export default PostDetailPage;
